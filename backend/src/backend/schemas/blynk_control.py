from typing import Literal

from pydantic import BaseModel, Field


ControlDevice = Literal["roof", "fan", "led"]
ControlValue = Literal[0, 1]


class BlynkControlRequest(BaseModel):
    device: ControlDevice
    value: ControlValue


class BlynkControlResponse(BaseModel):
    device: ControlDevice
    pin: str
    value: ControlValue
    success: bool