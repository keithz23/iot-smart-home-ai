from datetime import datetime

from pydantic import BaseModel, ConfigDict


class DeviceResponse(BaseModel):
    id: int
    device_id: str
    name: str
    location: str | None = None
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)