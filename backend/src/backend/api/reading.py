from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import desc, select

from backend.databases.databases import get_db
from backend.models.sensor_reading import SensorReading
from backend.services.blynk_service import BlynkService
from backend.services.sensor_reading_service import SensorReadingService

router = APIRouter(
    prefix="/readings",
    tags=["Sensor Readings"],
)

blynk_service = BlynkService()
reading_service = SensorReadingService()


@router.post("/sync")
async def sync_reading(
    db: AsyncSession = Depends(get_db),
):
    status = await blynk_service.get_status()

    reading = await reading_service.create_reading(
        db=db,
        device_id=1,
        status=status,
    )

    return reading



@router.get("/latest")
async def get_latest_reading(
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(SensorReading)
        .order_by(desc(SensorReading.recorded_at))
        .limit(1)
    )

    reading = result.scalar_one_or_none()

    return reading


@router.get("")
async def get_readings(
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(SensorReading)
    )

    readings = result.scalars().all()

    return readings
