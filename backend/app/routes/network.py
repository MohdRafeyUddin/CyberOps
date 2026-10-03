import os
import logging
from datetime import datetime, timezone, timedelta
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import desc, func

from ..database import get_db
from ..models import (
    Device,
    DeviceHistory,
    TrafficSample,
    NetworkEvent,
    CollectorStatus,
    NetworkSettings,
)
from ..schemas import (
    DeviceResponse,
    DeviceListResponse,
    DeviceDetailResponse,
    DeviceUpdate,
    TrafficSampleResponse,
    NetworkEventResponse,
    NetworkStatusResponse,
    TopologyResponse,
    TopologyNode,
    TopologyLink,
)

logger = logging.getLogger("NetworkRouter")
router = APIRouter(prefix="/network", tags=["Home Network Monitoring"])

DEVICE_OFFLINE_TIMEOUT = int(os.getenv("DEVICE_OFFLINE_TIMEOUT", "30"))


def format_bytes(b: float) -> str:
    """Format bytes into readable string (KB, MB, GB)."""
    if b is None or b < 0:
        return "0 B"
    for unit in ["B", "KB", "MB", "GB", "TB"]:
        if b < 1024.0:
            return f"{b:.1f} {unit}"
        b /= 1024.0
    return f"{b:.1f} PB"


def enforce_offline_timeouts(db: Session):
    """Dynamically verify and transition stale devices to OFFLINE based on DEVICE_OFFLINE_TIMEOUT."""
    now = datetime.now(timezone.utc)
    threshold = now - timedelta(seconds=DEVICE_OFFLINE_TIMEOUT)

    stale_devices = (
        db.query(Device)
        .filter(Device.status == "ONLINE", Device.last_seen < threshold, Device.is_gateway == False)
        .all()
    )

    for dev in stale_devices:
        dev.status = "OFFLINE"
        last_seen_dt = dev.last_seen
        if last_seen_dt.tzinfo is None:
            last_seen_dt = last_seen_dt.replace(tzinfo=timezone.utc)
        seconds_ago = int((now - last_seen_dt).total_seconds())

        print(f"[DISCOVERY] Device {dev.ip} last seen {seconds_ago} seconds ago")
        print(f"[DISCOVERY] Device {dev.ip} marked OFFLINE")

        db.add(NetworkEvent(
            device_id=dev.id,
            device_name=dev.custom_name or dev.hostname or dev.ip,
            event_type="DEVICE DISCONNECTED",
            details=f"Device {dev.hostname or dev.ip} stopped responding on LAN (last seen {seconds_ago}s ago)",
            severity="LOW",
            timestamp=now,
        ))

    if stale_devices:
        db.commit()


@router.get("/status", response_model=NetworkStatusResponse)
def get_network_status(db: Session = Depends(get_db)):
    """Retrieve overall home network status, device counts, and collector telemetry."""
    enforce_offline_timeouts(db)

    # Find latest collector heartbeat
    collector = db.query(CollectorStatus).order_by(desc(CollectorStatus.last_heartbeat)).first()

    now = datetime.now(timezone.utc)
    collector_online = False
    if collector and collector.last_heartbeat:
        hb_time = collector.last_heartbeat
        if hb_time.tzinfo is None:
            hb_time = hb_time.replace(tzinfo=timezone.utc)
        dt = (now - hb_time).total_seconds()
        collector_online = (dt <= 30)

    # Count total known and currently online devices
    total_known = db.query(Device).count()
    online_count = db.query(Device).filter(Device.status == "ONLINE").count() if collector_online else 0

    # Get latest traffic rates & totals
    latest_traffic = db.query(TrafficSample).order_by(desc(TrafficSample.timestamp)).first()
    traffic_avail = bool(latest_traffic is not None and collector_online)

    total_sent = latest_traffic.bytes_sent if latest_traffic else 0.0
    total_recv = latest_traffic.bytes_recv if latest_traffic else 0.0

    current_sent_rate = latest_traffic.bytes_sent_rate if latest_traffic and collector_online else 0.0
    current_recv_rate = latest_traffic.bytes_recv_rate if latest_traffic and collector_online else 0.0

    network_state = "ONLINE" if collector_online else "OFFLINE"
    if collector_online and online_count == 0:
        network_state = "DEGRADED"

    return NetworkStatusResponse(
        network_status=network_state,
        collector_online=collector_online,
        collector_name=collector.collector_name if collector else "No Collector Registered",
        gateway=collector.gateway if collector else "192.168.1.1",
        interface=collector.interface if collector else "Wi-Fi / Ethernet",
        total_devices=total_known,
        connected_devices=online_count,
        online_devices=online_count,
        total_download_formatted=format_bytes(total_recv) if traffic_avail else "Traffic data unavailable",
        total_upload_formatted=format_bytes(total_sent) if traffic_avail else "Traffic data unavailable",
        current_download_rate=current_recv_rate,
        current_upload_rate=current_sent_rate,
        last_updated=collector.last_heartbeat if collector else now,
        traffic_available=traffic_avail,
    )


from ..discovery import perform_lan_discovery, get_physical_network_context


@router.get("/devices", response_model=DeviceListResponse)
def list_devices(
    status: Optional[str] = Query(None, description="Filter by status: ONLINE, OFFLINE, ALL"),
    device_type: Optional[str] = Query(None, description="Filter by device type"),
    search: Optional[str] = Query(None, description="Search by hostname, IP, MAC, vendor"),
    refresh: bool = Query(False, description="Trigger fresh active reachability probe before returning"),
    db: Session = Depends(get_db),
):
    """List all home network devices with total known vs currently online breakdown."""
    if refresh:
        perform_lan_discovery(db)
    else:
        enforce_offline_timeouts(db)

    _, _, subnet_prefix = get_physical_network_context()

    total_known = db.query(Device).filter(Device.ip.startswith(subnet_prefix)).count()
    online_count = db.query(Device).filter(Device.status == "ONLINE", Device.ip.startswith(subnet_prefix)).count()

    query = db.query(Device).filter(Device.ip.startswith(subnet_prefix))

    if status and status.upper() != "ALL":
        query = query.filter(Device.status == status.upper())

    if device_type and device_type.upper() != "ALL":
        query = query.filter(Device.device_type == device_type)

    if search:
        s = f"%{search.strip()}%"
        query = query.filter(
            (Device.hostname.ilike(s)) |
            (Device.ip.ilike(s)) |
            (Device.mac.ilike(s)) |
            (Device.vendor.ilike(s)) |
            (Device.custom_name.ilike(s))
        )

    # Order gateway first, then online devices, then most recently seen
    devices_list = query.order_by(desc(Device.is_gateway), desc(Device.status), desc(Device.last_seen)).all()

    return DeviceListResponse(
        total_devices=total_known,
        online_devices=online_count,
        devices=devices_list,
    )


@router.post("/scan")
def trigger_network_scan(db: Session = Depends(get_db)):
    """Trigger an immediate LAN discovery scan."""
    result = perform_lan_discovery(db)
    return {"status": "scan_completed", **result}


@router.get("/devices/{device_id}", response_model=DeviceDetailResponse)
def get_device_details(device_id: int, db: Session = Depends(get_db)):
    """Retrieve full device details including connection history and network events."""
    enforce_offline_timeouts(db)

    device = db.query(Device).filter(Device.id == device_id).first()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")

    history = (
        db.query(DeviceHistory)
        .filter(DeviceHistory.device_id == device_id)
        .order_by(desc(DeviceHistory.timestamp))
        .limit(20)
        .all()
    )

    events = (
        db.query(NetworkEvent)
        .filter((NetworkEvent.device_id == device_id) | (NetworkEvent.device_name == device.hostname))
        .order_by(desc(NetworkEvent.timestamp))
        .limit(20)
        .all()
    )

    return DeviceDetailResponse(
        id=device.id,
        ip=device.ip,
        mac=device.mac,
        hostname=device.hostname,
        vendor=device.vendor,
        device_type=device.device_type,
        status=device.status,
        is_gateway=device.is_gateway,
        interface=device.interface,
        download_bytes=device.download_bytes,
        upload_bytes=device.upload_bytes,
        custom_name=device.custom_name,
        notes=device.notes,
        first_seen=device.first_seen,
        last_seen=device.last_seen,
        history=[{"id": h.id, "ip": h.ip, "status": h.status, "timestamp": h.timestamp} for h in history],
        events=[{
            "id": e.id,
            "timestamp": e.timestamp,
            "event_type": e.event_type,
            "details": e.details,
            "severity": e.severity
        } for e in events],
    )


@router.put("/devices/{device_id}", response_model=DeviceResponse)
def update_device(device_id: int, payload: DeviceUpdate, db: Session = Depends(get_db)):
    """Update custom label, device type, or notes for a device."""
    device = db.query(Device).filter(Device.id == device_id).first()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")

    if payload.custom_name is not None:
        device.custom_name = payload.custom_name.strip()
    if payload.device_type is not None:
        device.device_type = payload.device_type.strip()
    if payload.notes is not None:
        device.notes = payload.notes.strip()

    db.commit()
    db.refresh(device)
    return device


@router.delete("/devices/{device_id}")
def delete_device(device_id: int, db: Session = Depends(get_db)):
    """Remove a device record from the monitoring inventory."""
    device = db.query(Device).filter(Device.id == device_id).first()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")

    db.delete(device)
    db.commit()
    return {"status": "deleted", "device_id": device_id}


@router.get("/traffic", response_model=List[TrafficSampleResponse])
def get_traffic_history(
    range: str = Query("1h", description="Time range: 1h, 6h, 24h, 7d"),
    db: Session = Depends(get_db),
):
    """Retrieve actual time-series bandwidth samples for the specified range."""
    now = datetime.now(timezone.utc)
    delta_map = {
        "1h": timedelta(hours=1),
        "6h": timedelta(hours=6),
        "24h": timedelta(hours=24),
        "7d": timedelta(days=7),
    }
    cutoff = now - delta_map.get(range.lower(), timedelta(hours=1))

    samples = (
        db.query(TrafficSample)
        .filter(TrafficSample.timestamp >= cutoff)
        .order_by(TrafficSample.timestamp.asc())
        .all()
    )
    return samples


@router.get("/events", response_model=List[NetworkEventResponse])
def list_network_events(
    event_type: Optional[str] = Query(None, description="Filter by event type"),
    severity: Optional[str] = Query(None, description="Filter by severity: LOW, MEDIUM, HIGH, CRITICAL"),
    search: Optional[str] = Query(None, description="Search query"),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
):
    """Retrieve real network audit and lifecycle events."""
    query = db.query(NetworkEvent)

    if event_type and event_type.upper() != "ALL":
        query = query.filter(NetworkEvent.event_type == event_type.upper())

    if severity and severity.upper() != "ALL":
        query = query.filter(NetworkEvent.severity == severity.upper())

    if search:
        s = f"%{search.strip()}%"
        query = query.filter(
            (NetworkEvent.device_name.ilike(s)) |
            (NetworkEvent.details.ilike(s)) |
            (NetworkEvent.event_type.ilike(s))
        )

    return query.order_by(desc(NetworkEvent.timestamp)).limit(limit).all()


@router.get("/topology", response_model=TopologyResponse)
def get_network_topology(db: Session = Depends(get_db)):
    """Generate accurate node/link topology for discovered LAN devices."""
    enforce_offline_timeouts(db)
    nodes = []
    links = []

    # 1. Internet Gateway Node
    nodes.append(TopologyNode(
        id="internet",
        label="INTERNET",
        type="internet",
        status="ONLINE",
        is_gateway=False,
    ))

    # 2. Router Node
    gateway_device = db.query(Device).filter(Device.is_gateway == True).first()
    router_id = "router"
    router_label = gateway_device.hostname if gateway_device else "Home Router / Gateway"
    router_ip = gateway_device.ip if gateway_device else "192.168.1.1"

    nodes.append(TopologyNode(
        id=router_id,
        label=router_label,
        type="router",
        ip=router_ip,
        mac=gateway_device.mac if gateway_device else None,
        vendor=gateway_device.vendor if gateway_device else "Home Gateway",
        status="ONLINE",
        is_gateway=True,
    ))

    # Link Internet -> Router
    links.append(TopologyLink(source="internet", target=router_id, label="WAN"))

    # 3. Discovered Client Nodes
    client_devices = db.query(Device).filter(Device.is_gateway == False).all()
    for d in client_devices:
        node_id = f"dev_{d.id}"
        display_name = d.custom_name or d.hostname or f"Device {d.ip}"
        nodes.append(TopologyNode(
            id=node_id,
            label=display_name,
            type="device",
            ip=d.ip,
            mac=d.mac,
            vendor=d.vendor,
            status=d.status,
            is_gateway=False,
        ))
        # Link Router -> Client
        links.append(TopologyLink(source=router_id, target=node_id, label=d.interface or "LAN"))

    return TopologyResponse(nodes=nodes, links=links)


@router.get("/settings")
def get_settings(db: Session = Depends(get_db)):
    """Return current network settings and collector metadata."""
    settings_records = db.query(NetworkSettings).all()
    settings_dict = {s.key: s.value for s in settings_records}

    collector = db.query(CollectorStatus).order_by(desc(CollectorStatus.last_heartbeat)).first()

    return {
        "interface": settings_dict.get("interface", "Auto Detect"),
        "gateway": settings_dict.get("gateway", "Auto Detect"),
        "collection_interval": settings_dict.get("collection_interval", str(DEVICE_OFFLINE_TIMEOUT)),
        "router_adapter": settings_dict.get("router_adapter", "Generic (Passive)"),
        "router_host": settings_dict.get("router_host", "192.168.1.1"),
        "collector_online": bool(collector and collector.is_online),
        "collector_name": collector.collector_name if collector else "Home-Agent",
        "collector_ip": collector.ip_address if collector else "127.0.0.1",
        "collector_version": collector.version if collector else "1.0.0",
        "last_heartbeat": collector.last_heartbeat if collector else None,
    }


@router.post("/settings")
def update_settings(payload: dict, db: Session = Depends(get_db)):
    """Save user settings configuration without exposing sensitive secrets."""
    allowed_keys = ["interface", "gateway", "collection_interval", "router_adapter", "router_host"]
    for k, v in payload.items():
        if k in allowed_keys:
            rec = db.query(NetworkSettings).filter(NetworkSettings.key == k).first()
            if not rec:
                rec = NetworkSettings(key=k, value=str(v))
                db.add(rec)
            else:
                rec.value = str(v)
    db.commit()
    return {"status": "saved", "updated_keys": list(payload.keys())}
