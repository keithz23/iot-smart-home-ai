import asyncio

from sqlalchemy import select

from backend.databases.databases import AsyncSessionLocal
from backend.models.device import Device


async def seed():
    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(Device).where(
                Device.device_id == "ESP32-001"
            )
        )

        device = result.scalar_one_or_none()

        if device is not None:
            print("Device already exists: ESP32-001")
            return

        device = Device(
            device_id="ESP32-001",
            name="Smart Home ESP32",
            location="Living Room",
            is_active=True,
        )

        db.add(device)

        await db.commit()
        await db.refresh(device)

        print(f"Created device: {device.device_id}")


if __name__ == "__main__":
    asyncio.run(seed())