from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class UserResponse(BaseModel):
    id: int
    username: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class LoginRequest(BaseModel):
    username: str = Field(min_length=3, max_length=255)
    password: str = Field(min_length=1, max_length=255)
