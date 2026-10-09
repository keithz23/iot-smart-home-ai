from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.core.dependencies import get_current_user
from backend.databases.databases import get_db
from backend.models.user import User
from backend.schemas.ai import (
    AIChatRequest,
    AIChatResponse,
    AIConversationResponse,
    AIMessageResponse,
    DeviceActionRequest,
    DeviceActionResponse,
)
from backend.services.ai_service import answer_question
from backend.services.blynk_service import BlynkService
from backend.services.audit_log_service import AuditLogService
from backend.schemas.audit_logs import AuditLogCreate
from backend.models.device import Device
from backend.core.config import settings
from backend.models.ai_conversation import AIConversation, AIMessage


router = APIRouter(prefix="/ai", tags=["AI"])
blynk_service = BlynkService()
audit_log_service = AuditLogService()


@router.post("/chat", response_model=AIChatResponse)
async def chat(
    request: AIChatRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if request.conversation_id is None:
        conversation = AIConversation(
            user_id=current_user.id,
            title=request.message[:80],
        )
        db.add(conversation)
        await db.flush()
    else:
        conversation_result = await db.execute(
            select(AIConversation).where(
                AIConversation.id == request.conversation_id,
                AIConversation.user_id == current_user.id,
            )
        )
        conversation = conversation_result.scalar_one_or_none()
        if conversation is None:
            raise HTTPException(status_code=404, detail="Conversation not found")

    user_message = AIMessage(
        conversation_id=conversation.id,
        role="user",
        content=request.message,
    )
    db.add(user_message)
    await db.flush()

    response = await answer_question(db, request.message)
    assistant_message = AIMessage(
        conversation_id=conversation.id,
        role="assistant",
        content=response.answer,
        sources_json=response.sources,
        action_json=response.action.model_dump() if response.action else None,
    )
    conversation.updated_at = datetime.utcnow()
    db.add(assistant_message)
    await db.commit()
    await db.refresh(assistant_message)

    return AIChatResponse(
        conversation_id=conversation.id,
        message_id=assistant_message.id,
        answer=response.answer,
        sources=response.sources,
        action=response.action,
    )


@router.get(
    "/conversations",
    response_model=list[AIConversationResponse],
)
async def get_conversations(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(AIConversation)
        .where(AIConversation.user_id == current_user.id)
        .order_by(AIConversation.updated_at.desc())
    )
    return list(result.scalars().all())


@router.get(
    "/conversations/{conversation_id}/messages",
    response_model=list[AIMessageResponse],
)
async def get_conversation_messages(
    conversation_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    conversation_result = await db.execute(
        select(AIConversation).where(
            AIConversation.id == conversation_id,
            AIConversation.user_id == current_user.id,
        )
    )
    if conversation_result.scalar_one_or_none() is None:
        raise HTTPException(status_code=404, detail="Conversation not found")

    result = await db.execute(
        select(AIMessage)
        .where(AIMessage.conversation_id == conversation_id)
        .order_by(AIMessage.created_at.asc(), AIMessage.id.asc())
    )
    messages = result.scalars().all()
    return [
        AIMessageResponse(
            id=message.id,
            role=message.role,
            content=message.content,
            sources=message.sources_json or [],
            action=message.action_json,
            created_at=message.created_at,
        )
        for message in messages
    ]


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
