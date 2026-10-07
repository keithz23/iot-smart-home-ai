from fastapi import APIRouter

from backend.api.blynk import router as blynk_router
from backend.api.devices import router as devices_router
from backend.api.readings import router as reading_router

CONTROL_PINS = {
    "roof": "V9",
    "fan": "V10",
    "led": "V11",
}

router = APIRouter()

router.include_router(devices_router)
router.include_router(blynk_router)
router.include_router(reading_router)


@router.get("/health")
async def health_check():
    return {
        "status": "ok",
        "service": "iot-ai-system",
    }