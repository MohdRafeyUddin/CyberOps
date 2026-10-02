from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Event
from ..schemas import EventCreate, EventOut

router = APIRouter(prefix="/events", tags=["Events"])


@router.get("", response_model=List[EventOut])
def list_events(
    severity: Optional[str] = Query(None, description="Filter by severity (LOW, MEDIUM, HIGH, CRITICAL)"),
    status: Optional[str] = Query(None, description="Filter by status"),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db)
):
    query = db.query(Event).order_by(Event.created_at.desc())
    if severity and severity.upper() != "ALL":
        query = query.filter(Event.severity == severity.upper())
    if status and status.upper() != "ALL":
        query = query.filter(Event.status == status.upper())
    
    return query.limit(limit).all()


@router.post("", response_model=EventOut, status_code=201)
def create_event(event_in: EventCreate, db: Session = Depends(get_db)):
    db_event = Event(
        event_type=event_in.event_type,
        source=event_in.source,
        severity=event_in.severity.upper(),
        status=event_in.status.upper(),
        message=event_in.message or f"Event detected from {event_in.source}",
    )
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event


@router.delete("/{event_id}", status_code=204)
def delete_event(event_id: int, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    db.delete(event)
    db.commit()
    return None
