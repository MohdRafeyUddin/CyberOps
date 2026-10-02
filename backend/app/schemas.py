from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


# Asset Schemas
class AssetBase(BaseModel):
    name: str = Field(..., example="Primary API Gateway")
    target: str = Field(..., example="api.cyberops.internal")
    type: str = Field(default="Domain", example="Domain")
    status: str = Field(default="ONLINE", example="ONLINE")


class AssetCreate(AssetBase):
    pass


class AssetOut(AssetBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# Event Schemas
class EventBase(BaseModel):
    event_type: str = Field(..., example="Brute Force Attempt")
    source: str = Field(..., example="198.51.100.42")
    severity: str = Field(..., example="HIGH")  # LOW, MEDIUM, HIGH, CRITICAL
    status: str = Field(default="DETECTED", example="DETECTED")
    message: Optional[str] = Field(default=None, example="Multiple failed SSH authentication attempts on port 22")


class EventCreate(EventBase):
    pass


class EventOut(EventBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# Scanner Schemas
class ScanRequest(BaseModel):
    target: str = Field(..., example="example.com")
    scan_type: str = Field(default="http", example="http")  # port, http, dns, all


class ScanResult(BaseModel):
    target: str
    scan_type: str
    status: str
    duration_ms: int
    summary: dict
    logs: List[str]
    timestamp: datetime


# Dashboard Schemas
class ActivityPoint(BaseModel):
    time: str
    events_count: int
    critical_count: int


class DashboardStats(BaseModel):
    total_assets: int
    online_assets: int
    security_events: int
    critical_alerts: int
    recent_events: List[EventOut]
    activity_chart: List[ActivityPoint]
    system_status: str
