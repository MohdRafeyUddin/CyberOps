from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base


class Device(Base):
    __tablename__ = "devices"

    id = Column(Integer, primary_key=True, index=True)
    ip = Column(String(50), nullable=False, index=True)
    mac = Column(String(50), nullable=True, index=True)
    hostname = Column(String(255), nullable=True)
    vendor = Column(String(255), default="Unknown Vendor")
    device_type = Column(String(50), default="Network Client")  # Smartphone, Laptop / PC, Smart TV, IoT Device, Gateway / Router, etc.
    status = Column(String(20), default="ONLINE")  # ONLINE, OFFLINE
    is_gateway = Column(Boolean, default=False)
    interface = Column(String(100), default="Wi-Fi / Ethernet")
    download_bytes = Column(Float, default=0.0)
    upload_bytes = Column(Float, default=0.0)
    custom_name = Column(String(255), nullable=True)
    notes = Column(Text, nullable=True)
    first_seen = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    last_seen = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    @property
    def ip_address(self) -> str:
        return self.ip

    @property
    def mac_address(self) -> str:
        return self.mac or ""

    history = relationship("DeviceHistory", back_populates="device", cascade="all, delete-orphan")


class DeviceHistory(Base):
    __tablename__ = "device_history"

    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(Integer, ForeignKey("devices.id", ondelete="CASCADE"), nullable=False)
    ip = Column(String(50), nullable=False)
    status = Column(String(20), nullable=False)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    device = relationship("Device", back_populates="history")


class TrafficSample(Base):
    __tablename__ = "traffic_samples"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    bytes_sent = Column(Float, default=0.0)
    bytes_recv = Column(Float, default=0.0)
    bytes_sent_rate = Column(Float, default=0.0)  # bytes per sec
    bytes_recv_rate = Column(Float, default=0.0)  # bytes per sec
    packets_sent = Column(Integer, default=0)
    packets_recv = Column(Integer, default=0)
    interface = Column(String(100), default="Wi-Fi / Ethernet")


class NetworkEvent(Base):
    __tablename__ = "network_events"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    device_id = Column(Integer, nullable=True)
    device_name = Column(String(255), nullable=True)
    event_type = Column(String(100), nullable=False)  # DEVICE_CONNECTED, DEVICE_DISCONNECTED, IP_CHANGED, DEVICE_DISCOVERED, TRAFFIC_THRESHOLD, ROUTER_STATUS
    details = Column(Text, nullable=True)
    severity = Column(String(20), default="LOW")  # LOW, MEDIUM, HIGH, CRITICAL


class CollectorStatus(Base):
    __tablename__ = "collector_status"

    id = Column(Integer, primary_key=True, index=True)
    collector_name = Column(String(100), default="Home-Agent")
    ip_address = Column(String(50), default="127.0.0.1")
    gateway = Column(String(50), default="192.168.1.1")
    interface = Column(String(100), default="Wi-Fi / Ethernet")
    is_online = Column(Boolean, default=False)
    last_heartbeat = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    cpu_percent = Column(Float, default=0.0)
    memory_percent = Column(Float, default=0.0)
    version = Column(String(20), default="1.0.0")


class NetworkSettings(Base):
    __tablename__ = "network_settings"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(100), unique=True, nullable=False, index=True)
    value = Column(Text, nullable=True)


# Backwards compatibility models
class Asset(Base):
    __tablename__ = "assets"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    target = Column(String(255), nullable=False)
    type = Column(String(50), default="Domain")
    status = Column(String(50), default="ONLINE")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    event_type = Column(String(100), nullable=False)
    source = Column(String(255), nullable=False)
    severity = Column(String(20), nullable=False)
    status = Column(String(50), default="DETECTED")
    message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
