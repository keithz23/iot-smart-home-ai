from fastapi import APIRouter

from backend.api.blynk import router as blynk_router
from backend.api.devices import router as devices_router


router = APIRouter()

router.include_router(devices_router)
router.include_router(blynk_router)


@router.get("/health")
async def health_check():
    return {
        "status": "ok",
        "service": "iot-ai-system",
    }