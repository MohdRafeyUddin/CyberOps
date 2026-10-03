#!/usr/bin/env python3
"""
CYBEROPS HOME - Local Network Collector Agent with Real Presence Tracking
========================================================================
Performs non-intrusive LAN discovery and real-time active reachability verification:
- Inspects ARP/Neighbor table for candidate device IPs & MACs
- Concurrently verifies reachability for each candidate via ICMP/socket probes
- Re-probes known offline devices so reconnection is instantly detected
- Resolves hostnames and hardware vendors via MAC OUI
- Captures interface traffic throughput via psutil
- Emits real presence telemetry to the FastAPI backend
"""

import os
import re
import sys
import time
import socket
import logging
import platform
import subprocess
from pathlib import Path
from typing import Dict, List, Any, Optional, Set
from concurrent.futures import ThreadPoolExecutor, as_completed

try:
    import requests
except ImportError:
    print("[-] Missing 'requests' library. Run: pip install requests psutil python-dotenv")
    sys.exit(1)

try:
    import psutil
except ImportError:
    psutil = None

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] [CYBEROPS-COLLECTOR] %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("Collector")

# Load configuration from root .env
_ROOT_DIR = Path(__file__).resolve().parent.parent
_ROOT_ENV = _ROOT_DIR / ".env"
if _ROOT_ENV.exists():
    try:
        from dotenv import load_dotenv
        load_dotenv(dotenv_path=_ROOT_ENV)
    except Exception:
        pass

BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000").rstrip("/")
COLLECTOR_API_KEY = os.getenv("COLLECTOR_API_KEY", "cyberops-collector-secret-token")
DEVICE_SCAN_INTERVAL = int(os.getenv("DEVICE_SCAN_INTERVAL", os.getenv("COLLECTION_INTERVAL", "10")))
COLLECTOR_NAME = os.getenv("COLLECTOR_NAME", f"Home-Agent-{platform.node()}")

# MAC OUI Prefix Dictionary
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
    """Resolve vendor from MAC address prefix."""
    if not mac or mac in ("Auto-Gateway", "This-Machine", "N/A"):
        return "Unknown Vendor"
    normalized = mac.upper().replace("-", ":").strip()
    prefix = ":".join(normalized.split(":")[:3])
    return MAC_VENDORS.get(prefix, "Generic Network Device")


def guess_device_type(hostname: str, vendor: str, is_gateway: bool) -> str:
    """Heuristic helper to classify device type for icon and categorization."""
    if is_gateway:
        return "Gateway / Router"
    h = (hostname or "").lower()
    v = (vendor or "").lower()

    if "tv" in h or "bravia" in h or "samsung" in v and "tv" in h or "firetv" in v:
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


import struct
import ctypes


def is_ip_reachable(ip: str, timeout_ms: int = 500) -> Tuple[bool, Optional[str]]:
    """
    Actively verify if an IP address is reachable right now on the physical LAN link.
    Bypasses stale OS ARP caches using direct link-layer SendARP and ICMP ping.
    Returns (is_reachable, resolved_mac)
    """
    if not ip or ip.startswith("127."):
        return True, None

    os_type = platform.system().lower()

    # 1. Win32 SendARP - Real hardware-level ARP frame probe
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

    # 2. Strict ICMP single-packet ping
    try:
        if os_type == "windows":
            cmd = ["ping", "-n", "1", "-w", str(timeout_ms), ip]
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


class NetworkCollector:
    """Core collector agent class with real presence verification."""

    def __init__(self):
        self.headers = {
            "Authorization": f"Bearer {COLLECTOR_API_KEY}",
            "Content-Type": "application/json",
        }
        self.local_ip = self._get_local_ip()
        self.gateway_ip = self._get_default_gateway()
        self.interface_name = self._get_primary_interface()
        self.prev_traffic = None
        self.prev_traffic_time = None
        self.dns_cache: Dict[str, str] = {}
        self.known_ips: Set[str] = {self.local_ip, self.gateway_ip}

    def _get_local_ip(self) -> str:
        """Find the local IP address used for outbound communication."""
        try:
            s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            s.connect(("8.8.8.8", 80))
            ip = s.getsockname()[0]
            s.close()
            return ip
        except Exception:
            return "127.0.0.1"

    def _get_default_gateway(self) -> str:
        """Discover default gateway IP on Windows / Linux / macOS."""
        os_type = platform.system().lower()
        try:
            if os_type == "windows":
                cmd = ["route", "print", "0.0.0.0"]
                res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=3)
                for line in res.stdout.splitlines():
                    parts = line.strip().split()
                    if len(parts) >= 5 and parts[0] == "0.0.0.0" and parts[1] == "0.0.0.0":
                        return parts[2]
            else:
                cmd = ["ip", "route", "show", "default"]
                res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=3)
                for line in res.stdout.splitlines():
                    parts = line.strip().split()
                    if "via" in parts:
                        idx = parts.index("via")
                        if idx + 1 < len(parts):
                            return parts[idx + 1]
        except Exception as e:
            logger.debug(f"Gateway lookup error: {e}")

        # Fallback to local subnet .1
        if self.local_ip and self.local_ip != "127.0.0.1":
            segments = self.local_ip.split(".")
            return f"{segments[0]}.{segments[1]}.{segments[2]}.1"
        return "192.168.1.1"

    def _get_primary_interface(self) -> str:
        """Get the active network interface name."""
        if not psutil:
            return "Ethernet/Wi-Fi"
        try:
            addrs = psutil.net_if_addrs()
            for iface, if_addrs in addrs.items():
                for addr in if_addrs:
                    if addr.family == socket.AF_INET and addr.address == self.local_ip:
                        return iface
        except Exception:
            pass
        return "Wi-Fi / Ethernet"

    def _resolve_hostname(self, ip: str) -> str:
        """Resolve hostname via reverse DNS with timeout."""
        if ip in self.dns_cache:
            return self.dns_cache[ip]
        if ip == self.gateway_ip:
            name = "Home-Gateway.router"
            self.dns_cache[ip] = name
            return name
        if ip == self.local_ip:
            name = f"{platform.node()} (This Machine)"
            self.dns_cache[ip] = name
            return name

        try:
            name, _, _ = socket.gethostbyaddr(ip)
            self.dns_cache[ip] = name
            return name
        except Exception:
            name = f"Device-{ip.split('.')[-1]}"
            self.dns_cache[ip] = name
            return name

    def _fetch_known_devices_from_backend(self):
        """Fetch previously known device IPs from backend to ensure we re-probe offline devices."""
        try:
            url = f"{BACKEND_URL}/api/network/devices"
            res = requests.get(url, headers=self.headers, timeout=3)
            if res.status_code == 200:
                data = res.json()
                dev_list = data.get("devices", data) if isinstance(data, dict) else data
                for d in dev_list:
                    if d.get("ip"):
                        self.known_ips.add(d["ip"])
        except Exception:
            pass

    def _discover_candidates(self) -> List[Dict[str, Any]]:
        """
        Gather candidate devices from ARP table, gateway, local machine, and known inventory.
        Filters strictly by the physical subnet prefix to exclude virtual/Hyper-V adapters.
        """
        candidate_dict: Dict[str, Dict[str, Any]] = {}
        subnet_prefix = ".".join(self.local_ip.split(".")[:3]) + "." if self.local_ip != "127.0.0.1" else ".".join(self.gateway_ip.split(".")[:3]) + "."

        # Always include gateway and local host
        candidate_dict[self.gateway_ip] = {
            "ip": self.gateway_ip,
            "mac": "Auto-Gateway",
            "is_gateway": True,
        }
        candidate_dict[self.local_ip] = {
            "ip": self.local_ip,
            "mac": "This-Machine",
            "is_gateway": False,
        }

        # Include known inventory IPs (only if on the physical subnet)
        for ip in self.known_ips:
            if ip.startswith(subnet_prefix) and ip not in candidate_dict:
                candidate_dict[ip] = {
                    "ip": ip,
                    "mac": "",
                    "is_gateway": (ip == self.gateway_ip),
                }

        # Parse ARP cache for candidate MACs on physical subnet only
        try:
            cmd = ["arp", "-a"]
            res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=4)
            output = res.stdout

            ip_mac_pattern = re.compile(
                r"(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\s+([0-9a-fA-F:-]{17}|[0-9a-fA-F:-]{14})"
            )
            for line in output.splitlines():
                line = line.strip()
                match = ip_mac_pattern.search(line)
                if match:
                    ip = match.group(1)
                    mac = match.group(2).replace("-", ":").upper()
                    # Filter: must belong to the physical home subnet and not be broadcast/multicast
                    if not ip.startswith(subnet_prefix) or ip.endswith(".255") or ip.startswith("224.") or mac == "FF:FF:FF:FF:FF:FF":
                        continue
                    self.known_ips.add(ip)
                    if ip not in candidate_dict or not candidate_dict[ip].get("mac") or candidate_dict[ip]["mac"] == "Auto-Gateway":
                        candidate_dict[ip] = {
                            "ip": ip,
                            "mac": mac,
                            "is_gateway": (ip == self.gateway_ip),
                        }
                    else:
                        candidate_dict[ip]["mac"] = mac
        except Exception as e:
            logger.debug(f"ARP parse exception: {e}")

        return list(candidate_dict.values())

    def scan_network_presence(self) -> List[Dict[str, Any]]:
        """
        Actively verifies the real reachability of all candidate devices on LAN.
        Returns device list with accurate `is_reachable` boolean flags.
        """
        self._fetch_known_devices_from_backend()
        candidates = self._discover_candidates()
        subnet_prefix = ".".join(self.local_ip.split(".")[:3]) + "." if self.local_ip != "127.0.0.1" else ".".join(self.gateway_ip.split(".")[:3]) + "."

        print(f"[DISCOVERY] Starting LAN scan on physical subnet {subnet_prefix}0/24")

        # Concurrently check reachability with thread pool
        verified_devices = []

        def probe_device(cand):
            ip = cand["ip"]
            # Local machine is always reachable
            if ip == self.local_ip:
                reachable = True
                resolved_mac = None
            else:
                reachable, resolved_mac = is_ip_reachable(ip)

            mac = resolved_mac or cand.get("mac", "")
            vendor = lookup_vendor(mac)
            hostname = self._resolve_hostname(ip)
            device_type = guess_device_type(hostname, vendor, cand.get("is_gateway", False))

            return {
                "ip": ip,
                "mac": mac if mac not in ("Auto-Gateway", "This-Machine") else "N/A",
                "hostname": hostname,
                "vendor": vendor,
                "device_type": device_type,
                "status": "ONLINE" if reachable else "OFFLINE",
                "is_reachable": reachable,
                "is_gateway": cand.get("is_gateway", False),
                "interface": self.interface_name,
            }

        with ThreadPoolExecutor(max_workers=16) as executor:
            future_to_cand = {executor.submit(probe_device, cand): cand for cand in candidates}
            for future in as_completed(future_to_cand):
                try:
                    dev_info = future.result()
                    verified_devices.append(dev_info)
                    if dev_info["is_reachable"]:
                        print(f"[DISCOVERY] Found {dev_info['ip']}")
                    else:
                        print(f"[DISCOVERY] Device {dev_info['ip']} not detected")
                except Exception as e:
                    logger.debug(f"Probe worker error: {e}")

        online_count = sum(1 for d in verified_devices if d["is_reachable"])
        offline_count = len(verified_devices) - online_count
        print(f"[DISCOVERY] Scan completed: {online_count} online, {offline_count} offline")

        return verified_devices

    def _collect_traffic_sample(self) -> Optional[Dict[str, Any]]:
        """Collect real network interface bandwidth / IO counters."""
        if not psutil:
            return None

        try:
            counters = psutil.net_io_counters()
            now = time.time()

            bytes_sent = counters.bytes_sent
            bytes_recv = counters.bytes_recv
            packets_sent = counters.packets_sent
            packets_recv = counters.packets_recv

            sent_rate = 0.0
            recv_rate = 0.0

            if self.prev_traffic and self.prev_traffic_time:
                dt = max(0.1, now - self.prev_traffic_time)
                sent_rate = max(0.0, (bytes_sent - self.prev_traffic["bytes_sent"]) / dt)
                recv_rate = max(0.0, (bytes_recv - self.prev_traffic["bytes_recv"]) / dt)

            self.prev_traffic = {
                "bytes_sent": bytes_sent,
                "bytes_recv": bytes_recv,
            }
            self.prev_traffic_time = now

            return {
                "bytes_sent": bytes_sent,
                "bytes_recv": bytes_recv,
                "bytes_sent_rate": round(sent_rate, 2),
                "bytes_recv_rate": round(recv_rate, 2),
                "packets_sent": packets_sent,
                "packets_recv": packets_recv,
                "interface": self.interface_name,
            }
        except Exception as e:
            logger.debug(f"Traffic collection error: {e}")
            return None

    def register(self) -> bool:
        """Register collector instance with the FastAPI backend."""
        payload = {
            "collector_name": COLLECTOR_NAME,
            "ip_address": self.local_ip,
            "gateway": self.gateway_ip,
            "interface": self.interface_name,
            "platform": platform.platform(),
            "version": "1.0.0",
        }
        try:
            url = f"{BACKEND_URL}/api/collector/register"
            res = requests.post(url, json=payload, headers=self.headers, timeout=5)
            if res.status_code in (200, 201):
                logger.info(f"Registered collector with backend at {BACKEND_URL}")
                return True
            else:
                logger.warning(f"Registration response: {res.status_code} - {res.text}")
        except Exception as e:
            logger.warning(f"Unable to reach backend at {BACKEND_URL} during registration: {e}")
        return False

    def send_heartbeat(self):
        """Send health heartbeat to backend."""
        cpu = psutil.cpu_percent() if psutil else 0.0
        mem = psutil.virtual_memory().percent if psutil else 0.0
        payload = {
            "collector_name": COLLECTOR_NAME,
            "ip_address": self.local_ip,
            "gateway": self.gateway_ip,
            "interface": self.interface_name,
            "cpu_percent": cpu,
            "memory_percent": mem,
        }
        try:
            url = f"{BACKEND_URL}/api/collector/heartbeat"
            requests.post(url, json=payload, headers=self.headers, timeout=4)
        except Exception as e:
            logger.debug(f"Heartbeat failed: {e}")

    def sync_devices(self, devices: List[Dict[str, Any]]):
        """Send presence-verified devices list to backend."""
        payload = {
            "collector_name": COLLECTOR_NAME,
            "gateway_ip": self.gateway_ip,
            "devices": devices,
        }
        try:
            url = f"{BACKEND_URL}/api/collector/devices"
            res = requests.post(url, json=payload, headers=self.headers, timeout=6)
            if res.status_code == 200:
                data = res.json()
                logger.info(f"[DISCOVERY] Synced with backend: {data.get('online_devices', 0)} ONLINE / {data.get('total_devices', len(devices))} total known")
        except Exception as e:
            logger.warning(f"Device sync failed: {e}")

    def sync_traffic(self, traffic: Dict[str, Any]):
        """Send traffic I/O sample to backend."""
        payload = {
            "collector_name": COLLECTOR_NAME,
            "sample": traffic,
        }
        try:
            url = f"{BACKEND_URL}/api/collector/traffic"
            requests.post(url, json=payload, headers=self.headers, timeout=4)
        except Exception as e:
            logger.debug(f"Traffic sync failed: {e}")

    def run(self):
        """Main collector loop."""
        logger.info("=" * 65)
        logger.info("CYBEROPS HOME - Local Network Collector Started")
        logger.info(f"Local Host: {self.local_ip} | Gateway: {self.gateway_ip} | Interface: {self.interface_name}")
        logger.info(f"Target Backend: {BACKEND_URL}")
        logger.info(f"Device Scan Interval: {DEVICE_SCAN_INTERVAL}s")
        logger.info("=" * 65)

        self.register()

        cycle = 0
        while True:
            try:
                # 1. Send heartbeat
                self.send_heartbeat()

                # 2. Actively scan LAN presence and sync
                devices = self.scan_network_presence()
                self.sync_devices(devices)

                # 3. Collect & Sync Traffic stats
                traffic = self._collect_traffic_sample()
                if traffic:
                    self.sync_traffic(traffic)

                cycle += 1
            except KeyboardInterrupt:
                logger.info("Collector stopping on operator interrupt.")
                break
            except Exception as e:
                logger.error(f"Collector cycle error: {e}")

            time.sleep(DEVICE_SCAN_INTERVAL)


if __name__ == "__main__":
    collector = NetworkCollector()
    collector.run()
