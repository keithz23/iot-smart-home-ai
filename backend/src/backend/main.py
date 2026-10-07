from fastapi import FastAPI

from backend.api.router import router
from backend.core.config import settings


app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
)


app.include_router(
    router,
    prefix=settings.api_v1_prefix,
)