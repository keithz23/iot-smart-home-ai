from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.core.config import settings
from backend.models.device import Device
from backend.models.sensor_reading import SensorReading
from backend.services.blynk_service import BlynkService
from backend.services.sensor_reading_service import SensorReadingService


class BlynkSyncService:
    def __init__(self) -> None:
        self.blynk_service = BlynkService()
        self.reading_service = SensorReadingService()

    async def sync_latest_reading(
        self,
        db: AsyncSession,
    ) -> SensorReading:
        device_result = await db.execute(
            select(Device).where(
                Device.device_id == settings.blynk_device_id,
                Device.is_active.is_(True),
            )
        )
        device = device_result.scalar_one_or_none()
        if device is None:
            raise HTTPException(
                status_code=404,
                detail=(
                    f"Active device '{settings.blynk_device_id}' "
                    "is not configured"
                ),
            )

        status = await self.blynk_service.get_status()
        return await self.reading_service.create_reading(
            db=db,
            device_id=device.id,
            status=status,
        )
