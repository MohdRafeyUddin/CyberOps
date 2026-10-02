from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Asset
from ..schemas import AssetCreate, AssetOut

router = APIRouter(prefix="/assets", tags=["Assets"])


@router.get("", response_model=List[AssetOut])
def list_assets(db: Session = Depends(get_db)):
    return db.query(Asset).order_by(Asset.created_at.desc()).all()


@router.post("", response_model=AssetOut, status_code=201)
def add_asset(asset_in: AssetCreate, db: Session = Depends(get_db)):
    asset = Asset(
        name=asset_in.name,
        target=asset_in.target,
        type=asset_in.type,
        status=asset_in.status.upper(),
    )
    db.add(asset)
    db.commit()
    db.refresh(asset)
    return asset


@router.delete("/{asset_id}", status_code=204)
def delete_asset(asset_id: int, db: Session = Depends(get_db)):
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    db.delete(asset)
    db.commit()
    return None
