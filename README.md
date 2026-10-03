# CYBEROPS HOME - Home Network Monitoring Dashboard

**CYBEROPS HOME** is a real-time, non-intrusive home network monitoring platform designed to give homeowners full visibility into their authorized local area network (LAN).

---

## Architecture

```
                       HOME ROUTER / GATEWAY
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
      Laptop                   Phone                    Smart TV
         │
  [Network Collector]
         │ (HTTP REST / WebSocket)
         ▼
  [FastAPI Backend] ──(SQLite Database & WebSockets)
         │
         ▼
  [React / Vite Dashboard] (Dark Professional UI)
```

1. **Network Collector Agent (`collector/`)**: A safe, lightweight Python agent running on a LAN machine. Inspects local ARP/neighbor tables, performs reverse DNS hostname lookup, identifies hardware vendor via MAC OUI prefixes, and tracks real interface network I/O traffic rates (`psutil`).
2. **Backend API (`backend/`)**: FastAPI server providing token-protected ingestion for the collector, WebSocket broadcasts, device lifecycle tracking, and historical bandwidth telemetry.
3. **Frontend Dashboard (`frontend/`)**: Modern React + Vite application tailored for practical network monitoring (Dashboard, Connected Devices, Bandwidth Telemetry, Network Audit Events, and Router Settings).

---

## Getting Started

### 1. Start the Backend API
```bash
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
*API will start on `http://localhost:8000`.*

### 2. Start the Network Collector
In a new terminal:
```bash
cd collector
pip install -r requirements.txt
python collector.py
```
*The collector will automatically detect your local IP, default gateway, active interface, inspect the ARP table for active clients, and push telemetry to the backend every 5 seconds.*

### 3. Start the Frontend Dashboard
In a new terminal:
```bash
cd frontend
npm install
npm run dev
```
*Open your browser at `http://localhost:5173`.*

---

## Real Data vs Router-Specific Integration

### Real Data Collected Automatically:
- **Local Host IP & Gateway IP**: Resolved directly from OS routing tables.
- **LAN Connected Devices**: Discovered by non-intrusively parsing the active operating system ARP/Neighbor tables (`arp -a`, `ip neigh`).
- **Device MAC Addresses**: Extracted from ARP cache entries.
- **Device Hostnames**: Resolved via reverse DNS (`socket.gethostbyaddr`).
- **Hardware Vendors**: Resolved via MAC OUI prefix lookup (Apple, Intel, Samsung, Google, Asus, Raspberry Pi, TP-Link, Espressif, etc.).
- **Interface Bandwidth / Throughput**: Actual host interface upload/download bytes and per-second throughput rates measured via `psutil.net_io_counters()`.
- **Network Lifecycle Events**: Generated whenever a device connects, disconnects, or changes IP address.

### Metrics Requiring Router-Specific Integration:
- **Per-Device WAN Bandwidth Breakdown**: Individual per-client bandwidth utilization across external WAN flows requires router flow accounting (e.g. OpenWrt `ubus`/`iptables`/NetFlow or AsusWRT/UniFi REST APIs). When unauthenticated, the application accurately reports `"Traffic data unavailable"` instead of generating fake numbers.
- **Router Internal CPU/Memory**: Requires authenticated SNMP or router admin API access (configured in the Settings tab).
