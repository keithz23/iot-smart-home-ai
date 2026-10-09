import asyncio
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.api.router import router
from backend.core.config import settings
from backend.databases.databases import AsyncSessionLocal
from backend.services.blynk_sync_service import BlynkSyncService


logger = logging.getLogger(__name__)
blynk_sync_service = BlynkSyncService()


async def sync_blynk_periodically() -> None:
    while True:
        try:
            async with AsyncSessionLocal() as db:
                reading = await blynk_sync_service.sync_latest_reading(db)
                logger.info(
                    "Synced Blynk reading %s for device %s",
                    reading.id,
                    settings.blynk_device_id,
                )
        except asyncio.CancelledError:
            raise
        except Exception:
            logger.exception("Failed to sync the latest Blynk reading")

        await asyncio.sleep(30)


@asynccontextmanager
async def lifespan(_: FastAPI):
    sync_task = asyncio.create_task(sync_blynk_periodically())
    try:
        yield
    finally:
        sync_task.cancel()
        await sync_task


app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3001",
        "http://localhost:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(
    router,
    prefix=settings.api_v1_prefix,
)