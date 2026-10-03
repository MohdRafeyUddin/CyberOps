from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, field_serializer


class DeviceBase(BaseModel):
    ip: str
    mac: Optional[str] = None
    hostname: Optional[str] = None
    vendor: Optional[str] = "Unknown Vendor"
    device_type: Optional[str] = "Network Client"
    status: Optional[str] = "ONLINE"
    is_reachable: Optional[bool] = True
    is_gateway: Optional[bool] = False
    interface: Optional[str] = "Wi-Fi / Ethernet"


class DeviceCreate(DeviceBase):
    pass


class DeviceUpdate(BaseModel):
    custom_name: Optional[str] = None
    device_type: Optional[str] = None
    notes: Optional[str] = None


class DeviceResponse(BaseModel):
    id: int
    ip: str
    ip_address: Optional[str] = None
    mac: Optional[str] = None
    mac_address: Optional[str] = None
    hostname: Optional[str] = None
    vendor: Optional[str] = "Unknown Vendor"
    device_type: Optional[str] = "Network Client"
    status: str = "ONLINE"  # ONLINE, OFFLINE
    is_reachable: bool = True
    is_gateway: bool = False
    interface: Optional[str] = "Wi-Fi / Ethernet"
    download_bytes: float = 0.0
    upload_bytes: float = 0.0
    custom_name: Optional[str] = None
    notes: Optional[str] = None
    first_seen: datetime
    last_seen: datetime

    @field_serializer("first_seen", "last_seen", check_fields=False)
    def serialize_dt(self, dt: datetime, _info):
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.isoformat()

    class Config:
        from_attributes = True


class DeviceListResponse(BaseModel):
    total_devices: int
    online_devices: int
    devices: List[DeviceResponse]


class DeviceDetailResponse(DeviceResponse):
    history: List[Dict[str, Any]] = []
    events: List[Dict[str, Any]] = []


class TrafficSampleCreate(BaseModel):
    bytes_sent: float = 0.0
    bytes_recv: float = 0.0
    bytes_sent_rate: float = 0.0
    bytes_recv_rate: float = 0.0
    packets_sent: Optional[int] = 0
    packets_recv: Optional[int] = 0
    interface: Optional[str] = "Wi-Fi / Ethernet"


class TrafficSampleResponse(TrafficSampleCreate):
    id: int
    timestamp: datetime

    class Config:
        from_attributes = True


class NetworkEventResponse(BaseModel):
    id: int
    timestamp: datetime
    device_id: Optional[int] = None
    device_name: Optional[str] = None
    event_type: str
    details: Optional[str] = None
    severity: str = "LOW"

    class Config:
        from_attributes = True


class NetworkStatusResponse(BaseModel):
    network_status: str  # ONLINE, DEGRADED, OFFLINE
    collector_online: bool
    collector_name: Optional[str] = None
    gateway: Optional[str] = None
    interface: Optional[str] = None
    total_devices: int = 0
    connected_devices: int = 0
    online_devices: int = 0
    total_download_formatted: str = "0 B"
    total_upload_formatted: str = "0 B"
    current_download_rate: float = 0.0
    current_upload_rate: float = 0.0
    last_updated: Optional[datetime] = None
    traffic_available: bool = False


class CollectorRegisterRequest(BaseModel):
    collector_name: str
    ip_address: str
    gateway: str
    interface: str
    platform: Optional[str] = None
    version: Optional[str] = "1.0.0"


class CollectorHeartbeatRequest(BaseModel):
    collector_name: str
    ip_address: str
    gateway: str
    interface: str
    cpu_percent: Optional[float] = 0.0
    memory_percent: Optional[float] = 0.0


class CollectorDeviceSyncRequest(BaseModel):
    collector_name: str
    gateway_ip: str
    devices: List[DeviceBase]


class CollectorTrafficSyncRequest(BaseModel):
    collector_name: str
    sample: TrafficSampleCreate


class TopologyNode(BaseModel):
    id: str
    label: str
    type: str  # internet, router, device, collector
    ip: Optional[str] = None
    mac: Optional[str] = None
    vendor: Optional[str] = None
    status: str
    is_gateway: bool = False


class TopologyLink(BaseModel):
    source: str
    target: str
    label: Optional[str] = None


class TopologyResponse(BaseModel):
    nodes: List[TopologyNode]
    links: List[TopologyLink]


# Backwards compatibility schemas
class AssetBase(BaseModel):
    name: str
    target: str
    type: str = "Domain"
    status: str = "ONLINE"


class AssetCreate(AssetBase):
    pass


class AssetOut(AssetBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class AssetResponse(AssetOut):
    pass


class EventBase(BaseModel):
    event_type: str
    source: str
    severity: str
    status: str = "DETECTED"
    message: Optional[str] = None


class EventCreate(EventBase):
    pass


class EventOut(EventBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class EventResponse(EventOut):
    pass


class ActivityPoint(BaseModel):
    time: str
    events_count: int
    critical_count: int


class DashboardStats(BaseModel):
    total_assets: int
    online_assets: int
    security_events: int
    critical_alerts: int
    activity_chart: List[ActivityPoint]
    recent_events: List[EventOut]


class ScanRequest(BaseModel):
    target: str
    scan_type: str = "http"


class ScanSummary(BaseModel):
    resolved_ip: Optional[str] = None
    http_status: Optional[int] = None
    https_enabled: bool = False
    open_ports: List[int] = []


class ScanResult(BaseModel):
    target: str
    scan_type: str
    duration_ms: int
    summary: ScanSummary
    logs: List[str]
