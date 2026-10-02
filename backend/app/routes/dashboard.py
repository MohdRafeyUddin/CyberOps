from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Asset, Event
from ..schemas import DashboardStats, EventOut, ActivityPoint

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("", response_model=DashboardStats)
def get_dashboard_data(db: Session = Depends(get_db)):
    total_assets = db.query(Asset).count()
    online_assets = db.query(Asset).filter(Asset.status == "ONLINE").count()
    security_events = db.query(Event).count()
    critical_alerts = db.query(Event).filter(Event.severity == "CRITICAL").count()

    recent_events_db = db.query(Event).order_by(Event.created_at.desc()).limit(10).all()
    recent_events = [EventOut.model_validate(ev) for ev in recent_events_db]

    # Generate 7-point recent activity timeline
    now = datetime.now(timezone.utc)
    activity_chart = []
    for i in range(6, -1, -1):
        slot_time = now - timedelta(hours=i * 4)
        time_label = slot_time.strftime("%H:%M")
        
        # Calculate simulated/derived distribution based on real event count
        base_factor = (security_events % 7) + (i % 3) * 2 + 1
        crit_factor = 1 if (i == 1 or i == 4) and critical_alerts > 0 else 0
        
        activity_chart.append(ActivityPoint(
            time=time_label,
            events_count=max(2, base_factor),
            critical_count=crit_factor
        ))

    return DashboardStats(
        total_assets=total_assets,
        online_assets=online_assets,
        security_events=security_events,
        critical_alerts=critical_alerts,
        recent_events=recent_events,
        activity_chart=activity_chart,
        system_status="OPERATIONAL",
    )
