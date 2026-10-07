from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from backend.databases.databases import get_db
from backend.models.device import Device


router = APIRouter(prefix="/devices", tags=["Devices"])


@router.get("")
async def get_devices(
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Device)
    )

    devices = result.scalars().all()

    return devices