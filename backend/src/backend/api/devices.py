from backend.schemas.device import DeviceResponse
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException

from backend.databases.databases import get_db
from backend.models.device import Device


router = APIRouter(prefix="/devices", tags=["Devices"])


@router.get("", response_model=list[DeviceResponse],)
async def get_devices(
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Device)
    )

    devices = result.scalars().all()

    return devices

@router.get(
    "/{device_id}",
    response_model=DeviceResponse,
)
async def get_device(
    device_id: int,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Device).where(Device.id == device_id)
    )

    device = result.scalar_one_or_none()

    if device is None:
        raise HTTPException(
            status_code=404,
            detail="Device not found",
        )

    return device