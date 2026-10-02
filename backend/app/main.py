import os
from pathlib import Path
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load root .env file relative to project root
_ROOT_DIR = Path(__file__).resolve().parent.parent.parent
_ROOT_ENV = _ROOT_DIR / ".env"
if _ROOT_ENV.exists():
    load_dotenv(dotenv_path=_ROOT_ENV)
else:
    load_dotenv()


from .database import engine, Base, SessionLocal
from .models import Asset, Event
from .routes import dashboard, events, scanner, assets, system


def seed_sample_data():
    db = SessionLocal()
    try:
        # Check if assets table is empty
        if db.query(Asset).count() == 0:
            sample_assets = [
                Asset(name="Production Web Portal", target="portal.cyberops.net", type="Domain", status="ONLINE"),
                Asset(name="Edge API Gateway", target="api.cyberops.net", type="Domain", status="ONLINE"),
                Asset(name="Primary DB Cluster", target="10.0.4.12", type="IP", status="ONLINE"),
                Asset(name="Auth & Identity Service", target="auth.cyberops.net", type="Domain", status="ONLINE"),
                Asset(name="Legacy Internal VPN", target="10.0.1.50", type="IP", status="WARNING"),
                Asset(name="Staging Web App", target="stage.cyberops.net", type="Domain", status="ONLINE"),
                Asset(name="Public DNS Resolver", target="8.8.8.8", type="IP", status="ONLINE"),
            ]
            db.add_all(sample_assets)
            db.commit()

        # Check if events table is empty
        if db.query(Event).count() == 0:
            sample_events = [
                Event(
                    event_type="SQL Injection Attempt",
                    source="194.26.29.114",
                    severity="CRITICAL",
                    status="BLOCKED",
                    message="Detected classic ' OR '1'='1 payload on endpoint /api/auth/login. Blocked by WAF rule #942100.",
                ),
                Event(
                    event_type="SSH Brute Force Attack",
                    source="45.155.205.233",
                    severity="HIGH",
                    status="MITIGATED",
                    message="Over 240 failed root login attempts within 60 seconds. IP auto-banned via Fail2ban.",
                ),
                Event(
                    event_type="Port Sweep / Reconnaissance",
                    source="185.196.220.14",
                    severity="MEDIUM",
                    status="DETECTED",
                    message="Sequential TCP SYN scanning detected across ports 21, 22, 80, 443, 3306, 8080.",
                ),
                Event(
                    event_type="Unauthorized API Token Use",
                    source="198.51.100.89",
                    severity="HIGH",
                    status="INVESTIGATING",
                    message="Revoked JWT token attempted access to /api/v1/internal/admin/metrics.",
                ),
                Event(
                    event_type="DNS Query Flood",
                    source="172.67.180.20",
                    severity="LOW",
                    status="RESOLVED",
                    message="Minor amplification traffic observed on edge recursive resolver.",
                ),
                Event(
                    event_type="Cross-Site Scripting (XSS)",
                    source="103.151.125.9",
                    severity="MEDIUM",
                    status="BLOCKED",
                    message="Malicious script tag injected into feedback parameter. Sanitized and quarantined.",
                ),
                Event(
                    event_type="Outdated TLS Protocol Handshake",
                    source="203.0.113.15",
                    severity="LOW",
                    status="RESOLVED",
                    message="Client attempted TLS 1.0 connection. Upgraded to TLS 1.3 enforced.",
                ),
            ]
            db.add_all(sample_events)
            db.commit()
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create tables and seed demo data
    Base.metadata.create_all(bind=engine)
    seed_sample_data()
    yield
    # Shutdown logic if any


app = FastAPI(
    title="CYBEROPS API",
    description="Security Operations Center (SOC) Intelligence API",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS configuration
raw_cors = os.getenv("CORS_ORIGINS", "*")
if raw_cors.strip() == "*":
    origins = ["*"]
else:
    origins = [o.strip() for o in raw_cors.split(",") if o.strip()]
    if "http://localhost:5173" not in origins:
        origins.append("http://localhost:5173")
    if "http://localhost:80" not in origins:
        origins.append("http://localhost:80")
    if "http://localhost" not in origins:
        origins.append("http://localhost")

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
        "service": "CYBEROPS Security Intelligence Backend",
        "version": "1.0.0"
    }


# Include Routers with /api prefix
app.include_router(dashboard.router, prefix="/api")
app.include_router(events.router, prefix="/api")
app.include_router(scanner.router, prefix="/api")
app.include_router(assets.router, prefix="/api")
app.include_router(system.router, prefix="/api")
