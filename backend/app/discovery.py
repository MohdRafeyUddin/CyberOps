import os
import re
import time
import socket
import struct
import ctypes
import logging
import platform
import subprocess
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Any, Optional, Tuple, Set
from sqlalchemy.orm import Session

from .models import Device, DeviceHistory, NetworkEvent, CollectorStatus
from .websocket_manager import manager

logger = logging.getLogger("DiscoveryEngine")

DEVICE_SCAN_INTERVAL = int(os.getenv("DEVICE_SCAN_INTERVAL", "10"))
DEVICE_OFFLINE_TIMEOUT = int(os.getenv("DEVICE_OFFLINE_TIMEOUT", "30"))

# MAC OUI dictionary for vendor resolution
MAC_VENDORS = {
    "00:1A:2B": "Ayecom",
    "00:50:56": "VMware",
    "00:0C:29": "VMware",
    "08:00:27": "Oracle VirtualBox",
    "B8:27:EB": "Raspberry Pi Foundation",
    "DC:A6:32": "Raspberry Pi Foundation",
    "E4:5F:01": "Raspberry Pi Foundation",
    "28:CD:C1": "Apple",
    "3C:06:30": "Apple",
    "40:6C:8F": "Apple",
    "AC:BC:32": "Apple",
    "F0:18:98": "Apple",
    "F4:D4:88": "Apple",
    "70:EE:50": "Apple",
    "A4:83:E7": "Apple",
    "BC:D0:74": "Apple",
    "D0:81:7A": "Apple",
    "F0:9E:63": "Apple",
    "30:07:4D": "Samsung Electronics",
    "44:91:60": "Samsung Electronics",
    "88:36:5F": "Samsung Electronics",
    "AC:5F:3E": "Samsung Electronics",
    "CC:07:AB": "Samsung Electronics",
    "20:DF:B9": "Google",
    "3C:5A:37": "Google",
    "F4:F5:DB": "Google (Nest/Chromecast)",
    "50:C7:BF": "TP-Link",
    "60:32:B1": "TP-Link",
    "B0:95:75": "TP-Link",
    "C0:06:C3": "TP-Link",
    "EC:08:6B": "TP-Link",
    "00:1E:58": "D-Link",
    "14:D6:4D": "D-Link",
    "28:10:7B": "D-Link",
    "04:D4:C4": "AsusTek Computer",
    "04:42:1A": "AsusTek Computer",
    "10:7B:44": "AsusTek Computer",
    "24:4B:FE": "Espressif (IoT/Smart Device)",
    "30:AE:A4": "Espressif (IoT/Smart Device)",
    "48:E7:29": "Espressif (IoT/Smart Device)",
    "84:CC:A8": "Espressif (IoT/Smart Device)",
    "A4:CF:12": "Espressif (IoT/Smart Device)",
    "C4:4F:33": "Espressif (IoT/Smart Device)",
    "EC:FA:BC": "Espressif (IoT/Smart Device)",
    "00:17:88": "Philips Lighting (Hue)",
    "EC:B5:FA": "Philips Lighting (Hue)",
    "44:65:0D": "Amazon (Echo/FireTV)",
    "68:37:E9": "Amazon (Echo/FireTV)",
    "74:C2:46": "Amazon (Echo/FireTV)",
    "FC:65:DE": "Amazon (Echo/FireTV)",
    "00:04:4B": "NVIDIA",
    "48:B0:2D": "NVIDIA Shield",
    "00:09:BF": "Nintendo",
    "98:B6:E9": "Nintendo Switch",
    "00:D9:D1": "Sony Interactive (PlayStation)",
    "70:9E:29": "Sony Interactive (PlayStation)",
    "00:1D:D8": "Microsoft (Xbox)",
    "28:18:78": "Microsoft (Xbox)",
    "00:15:5D": "Microsoft Hyper-V",
    "00:1A:A0": "Dell",
    "D4:BE:D9": "Dell",
    "00:1E:0B": "HP",
    "3C:52:82": "HP",
    "00:1F:3B": "Intel",
    "48:51:B7": "Intel",
}


def lookup_vendor(mac: str) -> str:
    """Resolve hardware manufacturer from MAC prefix."""
    if not mac or mac in ("Auto-Gateway", "This-Machine", "N/A", ""):
        return "Unknown Vendor"
    normalized = mac.upper().replace("-", ":").strip()
    prefix = ":".join(normalized.split(":")[:3])
    return MAC_VENDORS.get(prefix, "Generic Network Device")


def guess_device_type(hostname: str, vendor: str, is_gateway: bool) -> str:
    if is_gateway:
        return "Gateway / Router"
    h = (hostname or "").lower()
    v = (vendor or "").lower()
    if "tv" in h or "bravia" in h or "firetv" in v:
        return "Smart TV"
    if "iphone" in h or "pixel" in h or "galaxy" in h or "oneplus" in h or "android" in h or "phone" in h:
        return "Smartphone"
    if "macbook" in h or "laptop" in h or "thinkpad" in h or "dell" in v or "asus" in v or "intel" in v:
        return "Laptop / PC"
    if "ipad" in h or "tablet" in h:
        return "Tablet"
    if "echo" in h or "nest" in v or "espressif" in v or "hue" in v or "smart" in h:
        return "IoT Device"
    if "switch" in h or "playstation" in v or "xbox" in v:
        return "Gaming Console"
    if "printer" in h or "hp" in v and "deskjet" in h:
        return "Printer"
    return "Network Client"


def get_physical_network_context() -> Tuple[str, str, str]:
    """
    Identifies the active physical LAN interface, local IP, and default gateway.
    Excludes virtual adapters (Hyper-V, VirtualBox, WSL).
    Returns (local_ip, gateway_ip, subnet_prefix) e.g. ('192.168.0.102', '192.168.0.1', '192.168.0.')
    """
    local_ip = "127.0.0.1"
    gateway_ip = "192.168.1.1"

    # Find local outbound IP
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        local_ip = s.getsockname()[0]
        s.close()
    except Exception:
        pass

    # Discover default gateway
    os_type = platform.system().lower()
    try:
        if os_type == "windows":
            cmd = ["route", "print", "0.0.0.0"]
            res = subprocess.run(cmd, capture_output=True, text=True, timeout=3)
            for line in res.stdout.splitlines():
                parts = line.strip().split()
                if len(parts) >= 5 and parts[0] == "0.0.0.0" and parts[1] == "0.0.0.0":
                    gateway_ip = parts[2]
                    break
        else:
            cmd = ["ip", "route", "show", "default"]
            res = subprocess.run(cmd, capture_output=True, text=True, timeout=3)
            for line in res.stdout.splitlines():
                parts = line.strip().split()
                if "via" in parts:
                    idx = parts.index("via")
                    if idx + 1 < len(parts):
                        gateway_ip = parts[idx + 1]
                        break
    except Exception:
        pass

    if local_ip != "127.0.0.1":
        parts = local_ip.split(".")
        subnet_prefix = f"{parts[0]}.{parts[1]}.{parts[2]}."
    else:
        parts = gateway_ip.split(".")
        subnet_prefix = f"{parts[0]}.{parts[1]}.{parts[2]}."

    return local_ip, gateway_ip, subnet_prefix


def active_arp_probe(ip: str) -> Tuple[bool, Optional[str]]:
    """
    Actively probes target IP on the physical LAN.
    Uses Win32 SendARP on Windows for immediate hardware-level verification.
    Falls back to ICMP ping.
    Returns (is_reachable, resolved_mac)
    """
    if not ip or ip.startswith("127."):
        return True, None

    os_type = platform.system().lower()

    # 1. Win32 SendARP (Direct real-time hardware ARP packet)
    if os_type == "windows":
        try:
            target_ip_bytes = socket.inet_aton(ip)
            ip_val = struct.unpack("<I", target_ip_bytes)[0]
            mac_buf = (ctypes.c_byte * 6)()
            mac_len = ctypes.c_ulong(6)
            res = ctypes.windll.iphlpapi.SendARP(ip_val, 0, ctypes.byref(mac_buf), ctypes.byref(mac_len))
            if res == 0:
                mac = ":".join(f"{b & 0xff:02X}" for b in mac_buf)
                return True, mac
        except Exception:
            pass

    # 2. Non-intrusive ICMP Ping probe
    try:
        if os_type == "windows":
            cmd = ["ping", "-n", "1", "-w", "500", ip]
        else:
            cmd = ["ping", "-c", "1", "-W", "1", ip]

        res = subprocess.run(cmd, capture_output=True, text=True, timeout=1.5)
        stdout = res.stdout.lower()
        if res.returncode == 0 and ("bytes=" in stdout or "time=" in stdout or "ttl=" in stdout):
            if "destination host unreachable" not in stdout and "request timed out" not in stdout:
                return True, None
    except Exception:
        pass

    return False, None


def perform_lan_discovery(db: Session) -> Dict[str, Any]:
    """
    Executes a complete, real LAN presence discovery cycle:
    1. Identifies physical home subnet (e.g. 192.168.0.x)
    2. Gathers candidate devices belonging ONLY to the home subnet
    3. Probes each candidate with active reachability checks
    4. Updates database records, last_seen timestamps, and ONLINE/OFFLINE states
    5. Cleans up non-physical LAN devices (like Hyper-V virtual adapters)
    """
    now = datetime.now(timezone.utc)
    local_ip, gateway_ip, subnet_prefix = get_physical_network_context()

    print(f"[DISCOVERY] Starting LAN scan on physical subnet {subnet_prefix}0/24")

    # Clean up any non-physical devices in DB (e.g. 192.168.125.x / Hyper-V)
    stale_foreign = db.query(Device).filter(~Device.ip.startswith(subnet_prefix)).all()
    for f_dev in stale_foreign:
        logger.info(f"Removing virtual/unrelated device {f_dev.ip} ({f_dev.vendor}) from home inventory")
        db.delete(f_dev)
    if stale_foreign:
        db.commit()

    # Gather known inventory devices from DB
    known_devices = db.query(Device).filter(Device.ip.startswith(subnet_prefix)).all()
    candidate_map: Dict[str, Dict[str, Any]] = {}

    # 1. Gateway
    candidate_map[gateway_ip] = {
        "ip": gateway_ip,
        "mac": "",
        "is_gateway": True,
        "hostname": "Home-Gateway.router",
    }

    # 2. Local machine
    candidate_map[local_ip] = {
        "ip": local_ip,
        "mac": "",
        "is_gateway": False,
        "hostname": f"{platform.node()} (This Machine)",
    }

    # 3. Known DB devices
    for d in known_devices:
        candidate_map[d.ip] = {
            "ip": d.ip,
            "mac": d.mac or "",
            "is_gateway": d.is_gateway,
            "hostname": d.hostname or f"Device-{d.ip.split('.')[-1]}",
        }

    # 4. Parse OS ARP table for candidates ONLY on the physical subnet
    try:
        cmd = ["arp", "-a"]
        res = subprocess.run(cmd, capture_output=True, text=True, timeout=3)
        ip_mac_pattern = re.compile(
            r"(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\s+([0-9a-fA-F:-]{17}|[0-9a-fA-F:-]{14})"
        )
        for line in res.stdout.splitlines():
            match = ip_mac_pattern.search(line)
            if match:
                ip = match.group(1)
                mac = match.group(2).replace("-", ":").upper()
                # Exclude broadcast/multicast and outside subnets
                if not ip.startswith(subnet_prefix) or ip.endswith(".255") or mac == "FF:FF:FF:FF:FF:FF":
                    continue
                if ip not in candidate_map:
                    candidate_map[ip] = {
                        "ip": ip,
                        "mac": mac,
                        "is_gateway": (ip == gateway_ip),
                        "hostname": f"Device-{ip.split('.')[-1]}",
                    }
                elif mac and not candidate_map[ip]["mac"]:
                    candidate_map[ip]["mac"] = mac
    except Exception as e:
        logger.debug(f"ARP parsing error: {e}")

    online_count = 0
    offline_count = 0

    # Probe all candidate devices concurrently
    def probe_worker(item):
        ip, cand = item
        if ip == local_ip:
            return ip, cand, True, None
        is_reach, resolved_mac = active_arp_probe(ip)
        return ip, cand, is_reach, resolved_mac

    probe_results = {}
    with ThreadPoolExecutor(max_workers=16) as executor:
        futures = [executor.submit(probe_worker, (ip, cand)) for ip, cand in candidate_map.items()]
        for fut in as_completed(futures):
            try:
                ip, cand, is_reach, resolved_mac = fut.result()
                probe_results[ip] = (cand, is_reach, resolved_mac)
            except Exception:
                pass

    # Process results and update database
    for ip, (cand, is_reachable, resolved_mac) in probe_results.items():

        mac = resolved_mac or cand.get("mac") or ""
        vendor = lookup_vendor(mac)
        hostname = cand.get("hostname")

        # Format default friendly hostname without blocking DNS timeouts
        if not hostname or hostname == f"Device-{ip.split('.')[-1]}":
            if ip == gateway_ip:
                hostname = "Home-Gateway.router"
            elif ip == local_ip:
                hostname = f"{platform.node()} (This Machine)"
            else:
                hostname = f"Device-{ip.split('.')[-1]}"

        device_type = guess_device_type(hostname, vendor, cand.get("is_gateway", False))

        # Query existing record
        device = db.query(Device).filter(Device.ip == ip).first()

        if is_reachable:
            online_count += 1
            print(f"[DISCOVERY] Found {ip}")

            if not device:
                # Newly discovered device
                device = Device(
                    ip=ip,
                    mac=mac if mac not in ("Auto-Gateway", "This-Machine", "") else "N/A",
                    hostname=hostname,
                    vendor=vendor,
                    device_type=device_type,
                    status="ONLINE",
                    is_gateway=cand.get("is_gateway", False),
                    interface="Wi-Fi / Ethernet",
                    first_seen=now,
                    last_seen=now,
                )
                db.add(device)
                db.flush()
                db.add(DeviceHistory(device_id=device.id, ip=ip, status="ONLINE", timestamp=now))
                db.add(NetworkEvent(
                    device_id=device.id,
                    device_name=device.custom_name or device.hostname or device.ip,
                    event_type="DEVICE DISCOVERED",
                    details=f"New device identified: {device.hostname or device.ip} [{device.vendor}] ({device.mac})",
                    severity="LOW",
                    timestamp=now,
                ))
            else:
                # Update last_seen to current timestamp
                device.last_seen = now
                if mac and (not device.mac or device.mac == "N/A"):
                    device.mac = mac
                if vendor and device.vendor == "Unknown Vendor":
                    device.vendor = vendor

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
                    print(f"[DISCOVERY] Device {ip} reconnected (marked ONLINE)")
        else:
            # Device not reachable during this probe
            if device:
                last_dt = device.last_seen
                if last_dt.tzinfo is None:
                    last_dt = last_dt.replace(tzinfo=timezone.utc)
                seconds_ago = int((now - last_dt).total_seconds())

                print(f"[DISCOVERY] Device {ip} not detected")

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
                    print(f"[DISCOVERY] Device {ip} marked OFFLINE")

                if device.status == "OFFLINE":
                    offline_count += 1
                else:
                    online_count += 1

    db.commit()

    total_known = db.query(Device).filter(Device.ip.startswith(subnet_prefix)).count()
    real_online = db.query(Device).filter(Device.status == "ONLINE", Device.ip.startswith(subnet_prefix)).count()
    real_offline = total_known - real_online

    print(f"[DISCOVERY] Scan completed: {real_online} online, {real_offline} offline")

    # Update collector status in DB
    active_collector = db.query(CollectorStatus).first()
    if not active_collector:
        active_collector = CollectorStatus(
            collector_name="CYBEROPS HOME Engine",
            ip_address=local_ip,
            gateway=gateway_ip,
            interface="Wi-Fi / Ethernet",
            is_online=True,
            last_heartbeat=now,
        )
        db.add(active_collector)
    else:
        active_collector.is_online = True
        active_collector.last_heartbeat = now
        active_collector.ip_address = local_ip
        active_collector.gateway = gateway_ip
    db.commit()

    return {
        "total_devices": total_known,
        "online_devices": real_online,
        "offline_devices": real_offline,
    }
