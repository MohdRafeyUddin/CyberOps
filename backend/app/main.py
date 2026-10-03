import os
import asyncio
from pathlib import Path
from contextlib import asynccontextmanager
from datetime import datetime, timezone, timedelta
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load root .env file relative to project root
_ROOT_DIR = Path(__file__).resolve().parent.parent.parent
_ROOT_ENV = _ROOT_DIR / ".env"
if _ROOT_ENV.exists():
    load_dotenv(dotenv_path=_ROOT_ENV)
else:
    load_dotenv()

DEVICE_OFFLINE_TIMEOUT = int(os.getenv("DEVICE_OFFLINE_TIMEOUT", "30"))
DEVICE_SCAN_INTERVAL = int(os.getenv("DEVICE_SCAN_INTERVAL", "10"))

from .database import engine, Base, SessionLocal
from .models import Device, DeviceHistory, CollectorStatus, NetworkEvent, NetworkSettings, Asset, Event
from .websocket_manager import manager
from .discovery import perform_lan_discovery
from .routes import network, collector, dashboard, events, scanner, assets, system


async def periodic_lan_discovery_worker():
    """Continuous periodic LAN discovery background worker."""
    while True:
        try:
            db = SessionLocal()
            # Run active reachability scan in worker thread to prevent blocking event loop
            res = await asyncio.to_thread(perform_lan_discovery, db)
            
            # Broadcast updated presence numbers to all active dashboard websockets
            await manager.broadcast({
                "type": "DEVICES_UPDATED",
                "total_devices": res["total_devices"],
                "online_devices": res["online_devices"],
            })
            db.close()
        except Exception as e:
            print(f"[DISCOVERY] Background discovery loop error: {e}")
        
        await asyncio.sleep(DEVICE_SCAN_INTERVAL)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Create database tables
    Base.metadata.create_all(bind=engine)
    
    # Run initial discovery on startup
    db = SessionLocal()
    try:
        perform_lan_discovery(db)
    except Exception as e:
        print(f"[DISCOVERY] Startup discovery error: {e}")
    finally:
        db.close()

    # Launch background periodic discovery worker
    discovery_task = asyncio.create_task(periodic_lan_discovery_worker())
    yield
    discovery_task.cancel()


app = FastAPI(
    title="CYBEROPS HOME API",
    description="Home Network Monitoring & Telemetry Engine",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS configuration
raw_cors = os.getenv("CORS_ORIGINS", "*")
if raw_cors.strip() == "*":
    origins = ["*"]
else:
    origins = [o.strip() for o in raw_cors.split(",") if o.strip()]
    for local_url in ["http://localhost:5173", "http://localhost:80", "http://localhost", "http://127.0.0.1:5173"]:
        if local_url not in origins:
            origins.append(local_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins != ["*"] else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health", tags=["Health"])
@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "online",
        "service": "CYBEROPS HOME Network Monitoring API",
        "version": "1.0.0",
        "defcon": "NORMAL",
    }


# WebSocket Endpoint for live dashboard updates
@app.websocket("/ws/network")
async def websocket_network_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception:
        manager.disconnect(websocket)


# Include CYBEROPS HOME Core Network Routers
app.include_router(network.router, prefix="/api")
app.include_router(collector.router, prefix="/api")

# Backwards compatible endpoints
app.include_router(dashboard.router, prefix="/api")
app.include_router(events.router, prefix="/api")
app.include_router(scanner.router, prefix="/api")
app.include_router(assets.router, prefix="/api")
app.include_router(system.router, prefix="/api")
