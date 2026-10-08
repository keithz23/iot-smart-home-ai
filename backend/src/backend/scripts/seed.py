import asyncio

from sqlalchemy import select

from backend.core.security import hash_password
from backend.core.config import settings
from backend.databases.databases import AsyncSessionLocal
from backend.models.device import Device
from backend.models.user import User


SAMPLE_USERS = (
    ("admin@example.com", "Admin@123"),
    ("user@example.com", "User@123"),
)


async def seed():
    async with AsyncSessionLocal() as db:
        device_result = await db.execute(
            select(Device).where(Device.device_id == settings.blynk_device_id)
        )
        device = device_result.scalar_one_or_none()
        if device is None:
            db.add(
                Device(
                    device_id=settings.blynk_device_id,
                    name="Smart Home ESP32",
                    location="Living Room",
                    is_active=True,
                )
            )
            print(f"Created device: {settings.blynk_device_id}")
        else:
            print(f"Device already exists: {settings.blynk_device_id}")

        for username, password in SAMPLE_USERS:
            user_result = await db.execute(
                select(User).where(User.username == username)
            )
            user = user_result.scalar_one_or_none()
            if user is not None:
                print(f"User already exists: {username}")
                continue

            db.add(
                User(
                    username=username,
                    password_hash=hash_password(password),
                    is_active=True,
                )
            )
            print(f"Created user: {username}")

        await db.commit()


if __name__ == "__main__":
    asyncio.run(seed())