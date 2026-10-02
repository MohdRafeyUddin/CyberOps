import os
import platform
import time
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from ..database import get_db

router = APIRouter(prefix="/system", tags=["System"])
START_TIME = time.time()


@router.get("")
def get_system_info(db: Session = Depends(get_db)):
    db_status = "ONLINE"
    try:
        db.execute(text("SELECT 1"))
    except Exception:
        db_status = "OFFLINE"

    uptime_seconds = int(time.time() - START_TIME)
    
    return {
        "status": "OPERATIONAL",
        "api_status": "ONLINE",
        "database_status": db_status,
        "frontend_status": "ONLINE",
        "api_version": "v1.0.0",
        "app_version": "1.0.0",
        "environment": os.getenv("ENVIRONMENT", "production"),
        "platform": platform.system(),
        "python_version": platform.python_version(),
        "uptime_seconds": uptime_seconds,
    }
