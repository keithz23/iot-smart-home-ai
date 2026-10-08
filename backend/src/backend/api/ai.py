from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.core.dependencies import get_current_user
from backend.databases.databases import get_db
from backend.models.user import User
from backend.schemas.ai import (
    AIChatRequest,
    AIChatResponse,
    DeviceActionRequest,
    DeviceActionResponse,
)
from backend.services.ai_service import answer_question
from backend.services.blynk_service import BlynkService
from backend.services.audit_log_service import AuditLogService
from backend.schemas.audit_logs import AuditLogCreate
from backend.models.device import Device
from backend.core.config import settings


router = APIRouter(prefix="/ai", tags=["AI"])
blynk_service = BlynkService()
audit_log_service = AuditLogService()


@router.post("/chat", response_model=AIChatResponse)
async def chat(
    request: AIChatRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await answer_question(db, request.message)


@router.post("/actions/execute", response_model=DeviceActionResponse)
async def execute_action(
    request: DeviceActionRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    pins = {"roof": "V9", "fan": "V10", "led": "V11"}
    device_result = await db.execute(
        select(Device).where(
            Device.device_id == settings.blynk_device_id,
            Device.is_active.is_(True),
        )
    )
    device = device_result.scalar_one_or_none()
    if device is None:
        raise HTTPException(status_code=404, detail="Active device is not configured")

    try:
        await blynk_service.update_virtual_pin(
            pin=pins[request.device],
            value=request.value,
        )
    except HTTPException as error:
        await audit_log_service.create_audit_log(
            db,
            AuditLogCreate(
                user_id=current_user.id,
                device_id=device.id,
                event_type="device_action_failed",
                source="ai",
                target=request.device,
                value_after=request.value,
                reason=request.reason,
                status="failed",
                confirmed_by_user=True,
                error_message=error.detail,
                metadata_json={"pin": pins[request.device]},
            ),
        )
        raise

    await audit_log_service.create_audit_log(
        db,
        AuditLogCreate(
            user_id=current_user.id,
            device_id=device.id,
            event_type="device_action_completed",
            source="ai",
            target=request.device,
            value_after=request.value,
            reason=request.reason,
            status="success",
            confirmed_by_user=True,
            metadata_json={"pin": pins[request.device]},
        ),
    )
    return DeviceActionResponse(
        device=request.device,
        value=request.value,
        reason=request.reason,
        success=True,
    )
