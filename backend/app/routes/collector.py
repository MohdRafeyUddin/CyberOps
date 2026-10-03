import os
import logging
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException, Header, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import desc

from ..database import get_db
from ..models import (
    Device,
    DeviceHistory,
    TrafficSample,
    NetworkEvent,
    CollectorStatus,
)
from ..schemas import (
    CollectorRegisterRequest,
    CollectorHeartbeatRequest,
    CollectorDeviceSyncRequest,
    CollectorTrafficSyncRequest,
)
from ..websocket_manager import manager

logger = logging.getLogger("CollectorRouter")
router = APIRouter(prefix="/collector", tags=["Collector Agent Ingestion"])

EXPECTED_API_KEY = os.getenv("COLLECTOR_API_KEY", "cyberops-collector-secret-token")
DEVICE_OFFLINE_TIMEOUT = int(os.getenv("DEVICE_OFFLINE_TIMEOUT", "30"))


def verify_collector_auth(authorization: str = Header(None)):
    """Enforce API token authentication for collector ingestion."""
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization header")
    token = authorization.replace("Bearer ", "").strip()
    if token != EXPECTED_API_KEY:
        raise HTTPException(status_code=403, detail="Invalid collector authentication token")
    return token


@router.post("/register")
async def register_collector(
    payload: CollectorRegisterRequest,
    auth: str = Depends(verify_collector_auth),
    db: Session = Depends(get_db),
):
    """Register or update a collector agent instance."""
    collector = db.query(CollectorStatus).filter(CollectorStatus.collector_name == payload.collector_name).first()
    now = datetime.now(timezone.utc)

    if not collector:
        collector = CollectorStatus(
            collector_name=payload.collector_name,
            ip_address=payload.ip_address,
            gateway=payload.gateway,
            interface=payload.interface,
            is_online=True,
            last_heartbeat=now,
            version=payload.version or "1.0.0",
        )
        db.add(collector)
    else:
        collector.ip_address = payload.ip_address
        collector.gateway = payload.gateway
        collector.interface = payload.interface
        collector.is_online = True
        collector.last_heartbeat = now
        collector.version = payload.version or "1.0.0"

    # Log collector registration event
    event = NetworkEvent(
        device_name=payload.collector_name,
        event_type="ROUTER_STATUS",
        details=f"Collector agent '{payload.collector_name}' online on {payload.interface} (Gateway: {payload.gateway})",
        severity="LOW",
        timestamp=now,
    )
    db.add(event)
    db.commit()

    await manager.broadcast({
        "type": "COLLECTOR_STATUS",
        "status": "ONLINE",
        "name": payload.collector_name,
        "gateway": payload.gateway,
    })

    return {"status": "registered", "collector_name": payload.collector_name}


@router.post("/heartbeat")
async def receive_heartbeat(
    payload: CollectorHeartbeatRequest,
    auth: str = Depends(verify_collector_auth),
    db: Session = Depends(get_db),
):
    """Update collector heartbeat timestamp and health metrics."""
    collector = db.query(CollectorStatus).filter(CollectorStatus.collector_name == payload.collector_name).first()
    now = datetime.now(timezone.utc)

    if collector:
        collector.last_heartbeat = now
        collector.is_online = True
        collector.cpu_percent = payload.cpu_percent or 0.0
        collector.memory_percent = payload.memory_percent or 0.0
        db.commit()

    return {"status": "ok", "timestamp": now}


@router.post("/devices")
async def sync_discovered_devices(
    payload: CollectorDeviceSyncRequest,
    auth: str = Depends(verify_collector_auth),
    db: Session = Depends(get_db),
):
    """
    Upsert discovered LAN devices with real reachability tracking.
    Updates last_seen only for reachable devices.
    Transitions stale devices to OFFLINE if timeout exceeded.
    """
    now = datetime.now(timezone.utc)
    updated_count = 0
    new_count = 0

    for item in payload.devices:
        is_reachable = getattr(item, "is_reachable", True)

        # Match device by MAC address or fallback to IP
        device = None
        if item.mac and item.mac not in ("Auto-Gateway", "This-Machine", "N/A", ""):
            device = db.query(Device).filter(Device.mac == item.mac).first()
        if not device:
            device = db.query(Device).filter(Device.ip == item.ip).first()

        if not device:
            # New device discovered!
            initial_status = "ONLINE" if is_reachable else "OFFLINE"
            device = Device(
                ip=item.ip,
                mac=item.mac,
                hostname=item.hostname,
                vendor=item.vendor or "Unknown Vendor",
                device_type=item.device_type or "Network Client",
                status=initial_status,
                is_gateway=item.is_gateway or (item.ip == payload.gateway_ip),
                interface=item.interface or "Wi-Fi / Ethernet",
                first_seen=now,
                last_seen=now if is_reachable else (now - timedelta(seconds=DEVICE_OFFLINE_TIMEOUT + 5)),
            )
            db.add(device)
            db.flush()

            # Record history
            db.add(DeviceHistory(device_id=device.id, ip=item.ip, status=initial_status, timestamp=now))

            # Record Event
            event_title = "ROUTER STATUS" if device.is_gateway else "DEVICE DISCOVERED"
            db.add(NetworkEvent(
                device_id=device.id,
                device_name=device.custom_name or device.hostname or device.ip,
                event_type=event_title,
                details=f"New device identified: {device.hostname or device.ip} [{device.vendor}] ({device.mac})",
                severity="LOW",
                timestamp=now,
            ))
            print(f"[DISCOVERY] Found device {device.ip} ({device.hostname})")
            new_count += 1
        else:
            # Check for IP change on MAC
            if item.ip != device.ip and is_reachable:
                old_ip = device.ip
                device.ip = item.ip
                db.add(NetworkEvent(
                    device_id=device.id,
                    device_name=device.custom_name or device.hostname or device.ip,
                    event_type="IP ADDRESS CHANGED",
                    details=f"Device {device.hostname or device.mac} moved from {old_ip} to {item.ip}",
                    severity="MEDIUM",
                    timestamp=now,
                ))

            # Update reachability presence
            if is_reachable:
                device.last_seen = now
                if device.status == "OFFLINE":
                    device.status = "ONLINE"
                    db.add(NetworkEvent(
                        device_id=device.id,
                        device_name=device.custom_name or device.hostname or device.ip,
                        event_type="DEVICE CONNECTED",
                        details=f"Device {device.hostname or device.ip} reconnected to home network",
                        severity="LOW",
                        timestamp=now,
                    ))
                    print(f"[DISCOVERY] Found device {device.ip}")
                    print(f"[DISCOVERY] Device {device.ip} reconnected (marked ONLINE)")
                else:
                    print(f"[DISCOVERY] Found device {device.ip}")
            else:
                # Device is not reachable in current scan
                last_dt = device.last_seen
                if last_dt.tzinfo is None:
                    last_dt = last_dt.replace(tzinfo=timezone.utc)
                seconds_ago = int((now - last_dt).total_seconds())

                print(f"[DISCOVERY] Device {device.ip} last seen {seconds_ago} seconds ago")

                if seconds_ago > DEVICE_OFFLINE_TIMEOUT and device.status == "ONLINE" and not device.is_gateway:
                    device.status = "OFFLINE"
                    db.add(NetworkEvent(
                        device_id=device.id,
                        device_name=device.custom_name or device.hostname or device.ip,
                        event_type="DEVICE DISCONNECTED",
                        details=f"Device {device.hostname or device.ip} stopped responding on LAN (last seen {seconds_ago}s ago)",
                        severity="LOW",
                        timestamp=now,
                    ))
                    print(f"[DISCOVERY] Device {device.ip} marked OFFLINE")

            if item.hostname and not device.custom_name:
                device.hostname = item.hostname
            if item.vendor and device.vendor == "Unknown Vendor":
                device.vendor = item.vendor
            if item.device_type:
                device.device_type = item.device_type

            updated_count += 1

    db.commit()

    total_devices = db.query(Device).count()
    online_devices = db.query(Device).filter(Device.status == "ONLINE").count()

    # Broadcast device sync event to WebSocket clients
    await manager.broadcast({
        "type": "DEVICES_UPDATED",
        "total_devices": total_devices,
        "online_devices": online_devices,
    })

    return {
        "status": "synced",
        "total_devices": total_devices,
        "online_devices": online_devices,
    }


@router.post("/traffic")
async def ingest_traffic_sample(
    payload: CollectorTrafficSyncRequest,
    auth: str = Depends(verify_collector_auth),
    db: Session = Depends(get_db),
):
    """Record interface traffic I/O sample."""
    sample_data = payload.sample
    now = datetime.now(timezone.utc)

    sample = TrafficSample(
        timestamp=now,
        bytes_sent=sample_data.bytes_sent,
        bytes_recv=sample_data.bytes_recv,
        bytes_sent_rate=sample_data.bytes_sent_rate,
        bytes_recv_rate=sample_data.bytes_recv_rate,
        packets_sent=sample_data.packets_sent or 0,
        packets_recv=sample_data.packets_recv or 0,
        interface=sample_data.interface or "Wi-Fi / Ethernet",
    )
    db.add(sample)

    # Check for traffic surge threshold (> 50 MB/s)
    if sample_data.bytes_recv_rate > 50 * 1024 * 1024:
        db.add(NetworkEvent(
            event_type="TRAFFIC THRESHOLD",
            details=f"High download throughput detected: {sample_data.bytes_recv_rate / (1024*1024):.1f} MB/s",
            severity="MEDIUM",
            timestamp=now,
        ))

    db.commit()

    # Broadcast live traffic update
    await manager.broadcast({
        "type": "TRAFFIC_TICK",
        "download_rate": sample_data.bytes_recv_rate,
        "upload_rate": sample_data.bytes_sent_rate,
        "bytes_recv": sample_data.bytes_recv,
        "bytes_sent": sample_data.bytes_sent,
    })

    return {"status": "recorded"}
