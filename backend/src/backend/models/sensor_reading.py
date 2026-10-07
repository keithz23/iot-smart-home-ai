from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.databases.base import Base


class SensorReading(Base):
    __tablename__ = "sensor_readings"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
    )

    device_id: Mapped[int] = mapped_column(
        ForeignKey("devices.id"),
        nullable=False,
        index=True,
    )

    temperature: Mapped[float | None] = mapped_column(Float)
    humidity: Mapped[float | None] = mapped_column(Float)

    door: Mapped[int | None] = mapped_column(Integer)
    light: Mapped[int | None] = mapped_column(Integer)
    rain: Mapped[int | None] = mapped_column(Integer)
    gas: Mapped[int | None] = mapped_column(Integer)

    person: Mapped[int | None] = mapped_column(Integer)
    vibration: Mapped[int | None] = mapped_column(Integer)

    rfid: Mapped[str | None] = mapped_column(String(255))

    roof: Mapped[int | None] = mapped_column(Integer)
    fan: Mapped[int | None] = mapped_column(Integer)
    led: Mapped[int | None] = mapped_column(Integer)

    recorded_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
        index=True,
    )

    device = relationship("Device")