from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, Text
from .database import Base


class Asset(Base):
    __tablename__ = "assets"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    target = Column(String(255), nullable=False)
    type = Column(String(50), default="Domain")  # Domain, IP, Server, API
    status = Column(String(50), default="ONLINE")  # ONLINE, OFFLINE, DEGRADED
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    event_type = Column(String(100), nullable=False)  # e.g., "SQL Injection Attempt", "Port Scan"
    source = Column(String(255), nullable=False)  # e.g., "192.168.1.105", "edge-router-01"
    severity = Column(String(20), nullable=False)  # LOW, MEDIUM, HIGH, CRITICAL
    status = Column(String(50), default="DETECTED")  # DETECTED, INVESTIGATING, MITIGATED, RESOLVED, BLOCKED
    message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
