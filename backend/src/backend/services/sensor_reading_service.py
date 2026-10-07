from sqlalchemy.ext.asyncio import AsyncSession

from backend.models.sensor_reading import SensorReading
from backend.schemas.blynk import BlynkStatus


class SensorReadingService:

    async def create_reading(
        self,
        db: AsyncSession,
        device_id: int,
        status: BlynkStatus,
    ) -> SensorReading:

        reading = SensorReading(
            device_id=device_id,
            temperature=status.temperature,
            humidity=status.humidity,
            door=status.door,
            light=status.light,
            rain=status.rain,
            gas=status.gas,
            person=status.person,
            vibration=status.vibration,
            rfid=status.rfid,
            roof=status.roof,
            fan=status.fan,
            led=status.led,
        )

        db.add(reading)

        await db.commit()
        await db.refresh(reading)

        return reading