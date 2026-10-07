# Tai sao | None?
# Vì Blynk getAll có thể không trả một datastream nếu datastream đó chưa có giá trị.
from pydantic import BaseModel


class BlynkStatus(BaseModel):
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