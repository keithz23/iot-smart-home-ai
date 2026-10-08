from fastapi import APIRouter

from backend.api.auth import router as auth_router
from backend.api.ai import router as ai_router
from backend.api.blynk import router as blynk_router
from backend.api.devices import router as devices_router
from backend.api.readings import router as reading_router
from backend.api.audit_logs import router as audit_logs_router

CONTROL_PINS = {
    "roof": "V9",
    "fan": "V10",
    "led": "V11",
}

router = APIRouter()

router.include_router(auth_router)
router.include_router(ai_router)
router.include_router(devices_router)
router.include_router(blynk_router)
router.include_router(reading_router)
router.include_router(audit_logs_router)


@router.get("/health")
async def health_check():
    return {
        "status": "ok",
        "service": "iot-ai-system",
    }