from fastapi import APIRouter
from datetime import datetime
import time

router = APIRouter()

# Track server start time for uptime calculation
_start_time = time.time()


@router.get("/health")
def health_check():
    """
    Health check endpoint for monitoring backend connectivity and status.
    Returns health status, timestamp, version, and uptime information.
    """
    uptime_seconds = int(time.time() - _start_time)
    
    # Convert uptime to human-readable format
    days = uptime_seconds // 86400
    hours = (uptime_seconds % 86400) // 3600
    minutes = (uptime_seconds % 3600) // 60
    seconds = uptime_seconds % 60
    
    uptime_str = f"{days}d {hours}h {minutes}m {seconds}s" if days > 0 else \
                 f"{hours}h {minutes}m {seconds}s" if hours > 0 else \
                 f"{minutes}m {seconds}s" if minutes > 0 else \
                 f"{seconds}s"
    
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "version": "1.0.0",
        "uptime": uptime_str,
        "uptime_seconds": uptime_seconds
    }


@router.get("/hello")
def read_root():
    """Legacy hello endpoint for backward compatibility."""
    return {"message": "Hello, World!"}
