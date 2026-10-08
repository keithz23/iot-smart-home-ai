from datetime import datetime

from pydantic import BaseModel, ConfigDict


class AuditLogResponse(BaseModel):
    id: int

    user_id: int | None = None
    device_id: int | None = None

    event_type: str
    source: str
    target: str | None = None

    value_before: int | None = None
    value_after: int | None = None

    request_text: str | None = None
    reason: str | None = None

    status: str
    confirmed_by_user: bool

    error_message: str | None = None
    metadata_json: dict | None = None

    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AuditLogCreate(BaseModel):
    user_id: int | None = None
    device_id: int | None = None

    event_type: str
    source: str
    target: str | None = None

    value_before: int | None = None
    value_after: int | None = None

    request_text: str | None = None
    reason: str | None = None

    status: str
    confirmed_by_user: bool = False

    error_message: str | None = None
    metadata_json: dict | None = None


class AuditLogListResponse(BaseModel):
    items: list[AuditLogResponse]
    page: int
    limit: int
    total: int
    total_pages: int
