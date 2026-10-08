from math import ceil

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.core.dependencies import get_current_user
from backend.databases.databases import get_db
from backend.models.audit_logs import AuditLog
from backend.models.user import User
from backend.schemas.audit_logs import AuditLogListResponse


router = APIRouter(prefix="/audit-logs", tags=["Audit Logs"])


@router.get("", response_model=AuditLogListResponse)
async def get_audit_logs(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    count_result = await db.execute(select(func.count()).select_from(AuditLog))
    total = count_result.scalar_one()

    result = await db.execute(
        select(AuditLog)
        .order_by(AuditLog.created_at.desc(), AuditLog.id.desc())
        .offset((page - 1) * limit)
        .limit(limit)
    )

    return AuditLogListResponse(
        items=list(result.scalars().all()),
        page=page,
        limit=limit,
        total=total,
        total_pages=ceil(total / limit) if total else 0,
    )
