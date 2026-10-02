from fastapi import APIRouter, HTTPException
from ..schemas import ScanRequest, ScanResult
from ..services.scanner_service import run_security_scan

router = APIRouter(prefix="/scanner", tags=["Scanner"])


@router.post("/scan", response_model=ScanResult)
def start_scan(payload: ScanRequest):
    if not payload.target or len(payload.target.strip()) == 0:
        raise HTTPException(status_code=400, detail="Target host or IP cannot be empty")
    
    scan_type = payload.scan_type.lower() if payload.scan_type else "http"
    if scan_type not in ["http", "port", "dns", "all"]:
        scan_type = "http"
        
    result = run_security_scan(target=payload.target, scan_type=scan_type)
    return result
