from sqlalchemy.ext.asyncio import AsyncSession

from backend.models.audit_logs import AuditLog
from backend.schemas.audit_logs import AuditLogCreate


class AuditLogService:

    async def create_audit_log(
        self,
        db: AsyncSession,
        data: AuditLogCreate,
    ) -> AuditLog:
        audit_log = AuditLog(
            user_id=data.user_id,
            device_id=data.device_id,
            event_type=data.event_type,
            source=data.source,
            target=data.target,
            value_before=data.value_before,
            value_after=data.value_after,
            request_text=data.request_text,
            reason=data.reason,
            status=data.status,
            confirmed_by_user=data.confirmed_by_user,
            error_message=data.error_message,
            metadata_json=data.metadata_json,
        )

        db.add(audit_log)

        await db.commit()
        await db.refresh(audit_log)

        return audit_log
