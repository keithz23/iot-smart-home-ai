from fastapi import APIRouter

from backend.schemas.blynk import BlynkStatus
from backend.services.blynk_service import BlynkService


router = APIRouter(
    prefix="/blynk",
    tags=["Blynk"],
)

blynk_service = BlynkService()


@router.get("/raw")
async def get_blynk_raw():
    return await blynk_service.get_all_datastreams()


@router.get("/status", response_model=BlynkStatus)
async def get_blynk_status():
    return await blynk_service.get_status()