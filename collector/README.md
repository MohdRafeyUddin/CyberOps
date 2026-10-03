# CYBEROPS HOME - Local Network Collector

The **CYBEROPS HOME Collector** is a safe, non-intrusive Python agent that monitors your authorized home network.

## Responsibilities
- Resolves local IP, default gateway, and active interface
- Inspects operating system ARP/Neighbor tables (`arp -a`, `ip neigh`)
- Performs reverse DNS hostname resolution (`socket.gethostbyaddr`)
- Identifies hardware vendors using MAC OUI prefix lookup
- Records real interface network I/O traffic rates via `psutil`
- Streams telemetry to the FastAPI backend over authenticated REST & WebSockets

## Quick Start

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Configure Environment (Optional)
The collector automatically reads `.env` from the project root:
```env
BACKEND_URL=http://localhost:8000
COLLECTOR_API_KEY=cyberops-collector-secret-token
COLLECTION_INTERVAL=5
```

### 3. Run Collector
```bash
python collector.py
```
