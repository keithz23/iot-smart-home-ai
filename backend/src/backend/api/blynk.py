from fastapi import APIRouter

from backend.schemas.blynk import BlynkStatus
from backend.schemas.blynk_control import (
    BlynkControlRequest,
    BlynkControlResponse,
    ControlDevice,
)
from backend.services.blynk_service import BlynkService


router = APIRouter(
    prefix="/blynk",
    tags=["Blynk"],
)

blynk_service = BlynkService()


CONTROL_PINS: dict[ControlDevice, str] = {
    "roof": "V9",
    "fan": "V10",
    "led": "V11",
}


@router.get("/raw")
async def get_blynk_raw():
    return await blynk_service.get_all_datastreams()


@router.get(
    "/status",
    response_model=BlynkStatus,
)
async def get_blynk_status():
    return await blynk_service.get_status()


@router.post(
    "/control",
    response_model=BlynkControlResponse,
)
async def control_device(
    request: BlynkControlRequest,
):
    pin = CONTROL_PINS[request.device]

    await blynk_service.update_virtual_pin(
        pin=pin,
        value=request.value,
    )

    return BlynkControlResponse(
        device=request.device,
        pin=pin,
        value=request.value,
        success=True,
    )