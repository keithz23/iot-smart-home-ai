from typing import Literal

from pydantic import BaseModel, Field


class AIChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=4000)


class DeviceActionProposal(BaseModel):
    device: Literal["roof", "fan", "led"]
    value: Literal[0, 1]
    reason: str = Field(min_length=1, max_length=1000)


class AIChatResponse(BaseModel):
    answer: str
    sources: list[str] = []
    action: DeviceActionProposal | None = None


class DeviceActionRequest(DeviceActionProposal):
    pass


class DeviceActionResponse(DeviceActionProposal):
    success: bool
