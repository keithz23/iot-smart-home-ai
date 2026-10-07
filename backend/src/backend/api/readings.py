from backend.schemas.sensor_reading import SensorReadingListResponse, SensorReadingResponse
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import desc, select
from math import ceil
from datetime import datetime
from fastapi import HTTPException

from sqlalchemy import func

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


@router.post("/sync", response_model=SensorReadingResponse)
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



@router.get(
    "/latest",
    response_model=SensorReadingResponse | None,
)
async def get_latest_reading(
    device_id: int | None = Query(
        default=None,
        ge=1,
    ),
    db: AsyncSession = Depends(get_db),
):
    query = select(SensorReading)

    if device_id is not None:
        query = query.where(
            SensorReading.device_id == device_id
        )

    query = (
        query
        .order_by(SensorReading.recorded_at.desc())
        .limit(1)
    )

    result = await db.execute(query)

    return result.scalar_one_or_none()


@router.get(
    "",
    response_model=SensorReadingListResponse,
)
async def get_readings(
    page: int = Query(
        default=1,
        ge=1,
    ),
    limit: int = Query(
        default=20,
        ge=1,
        le=100,
    ),
    device_id: int | None = Query(
        default=None,
        ge=1,
    ),
    db: AsyncSession = Depends(get_db),
):
    # Base query
    query = select(SensorReading)

    if device_id is not None:
        query = query.where(
            SensorReading.device_id == device_id
        )

    # Sort newest → oldest
    query = query.order_by(
        SensorReading.recorded_at.desc()
    )

    # Count total records
    count_query = select(
        func.count()
    ).select_from(SensorReading)

    if device_id is not None:
        count_query = count_query.where(
            SensorReading.device_id == device_id
        )

    count_result = await db.execute(count_query)

    total = count_result.scalar_one()

    # Pagination
    offset = (page - 1) * limit

    result = await db.execute(
        query
        .offset(offset)
        .limit(limit)
    )

    readings = result.scalars().all()

    total_pages = ceil(total / limit) if total > 0 else 0

    return SensorReadingListResponse(
        items=readings,
        page=page,
        limit=limit,
        total=total,
        total_pages=total_pages,
    )
    
    
@router.get(
    "/history",
    response_model=list[SensorReadingResponse],
)
async def get_reading_history(
    device_id: int = Query(..., ge=1),
    from_time: datetime | None = None,
    to_time: datetime | None = None,
    limit: int = Query(
        default=100,
        ge=1,
        le=1000,
    ),
    db: AsyncSession = Depends(get_db),
):
    
    if from_time is not None and to_time is not None:
        if from_time > to_time:
            raise HTTPException(
                status_code=400,
                detail="from_time must be before or equal to to_time",
            )
            
    query = select(SensorReading).where(
        SensorReading.device_id == device_id
    )

    if from_time is not None:
        query = query.where(
            SensorReading.recorded_at >= from_time
        )

    if to_time is not None:
        query = query.where(
            SensorReading.recorded_at <= to_time
        )

    query = (
        query
        .order_by(SensorReading.recorded_at.asc())
        .limit(limit)
    )

    result = await db.execute(query)

    return result.scalars().all()