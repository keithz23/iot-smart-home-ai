from typing import Literal
from datetime import datetime

from pydantic import BaseModel, Field


class AIChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=4000)
    conversation_id: int | None = Field(default=None, ge=1)


class DeviceActionProposal(BaseModel):
    device: Literal["roof", "fan", "led"]
    value: Literal[0, 1]
    reason: str = Field(min_length=1, max_length=1000)


class AIAnswerResponse(BaseModel):
    answer: str
    sources: list[str] = []
    action: DeviceActionProposal | None = None


class AIChatResponse(BaseModel):
    conversation_id: int
    message_id: int
    answer: str
    sources: list[str] = []
    action: DeviceActionProposal | None = None


class AIConversationResponse(BaseModel):
    id: int
    title: str
    created_at: datetime
    updated_at: datetime


class AIMessageResponse(BaseModel):
    id: int
    role: Literal["user", "assistant"]
    content: str
    sources: list[str] = []
    action: DeviceActionProposal | None = None
    created_at: datetime


class DeviceActionRequest(DeviceActionProposal):
    pass


class DeviceActionResponse(DeviceActionProposal):
    success: bool
