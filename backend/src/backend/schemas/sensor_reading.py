from datetime import datetime

from pydantic import BaseModel, ConfigDict

class SensorReadingResponse(BaseModel):
    id: int
    device_id: int
    temperature: float | None = None
    humidity: float | None = None
    door: int | None = None
    light: int | None = None
    rain: int | None = None
    gas: int | None = None
    person: int | None = None
    vibration: int | None = None
    rfid: str | None = None
    roof: int | None = None
    fan: int | None = None
    led: int | None = None
    recorded_at: datetime

    model_config = ConfigDict(from_attributes=True)
    
    
class SensorReadingListResponse(BaseModel):
    items: list[SensorReadingResponse]
    page: int
    limit: int
    total: int
    total_pages: int