from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from backend.core.config import settings
from backend.core.dependencies import get_current_user
from backend.core.security import create_access_token
from backend.databases.databases import get_db
from backend.models.user import User
from backend.schemas.user import LoginRequest, UserResponse
from backend.services.auth_service import authenticate_user
from backend.services.audit_log_service import AuditLogService
from backend.schemas.audit_logs import AuditLogCreate


router = APIRouter(prefix="/auth", tags=["Authentication"])
audit_log_service = AuditLogService()


@router.post("/login", response_model=UserResponse)
async def login(
    request: LoginRequest,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    user = await authenticate_user(db, request.username, request.password)
    if user is None:
        await audit_log_service.create_audit_log(
            db,
            AuditLogCreate(
                event_type="login_failed",
                source="user",
                target=request.username,
                request_text=request.username,
                reason="Invalid username or password",
                status="failed",
                metadata_json={"username": request.username},
            ),
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )

    response.set_cookie(
        key=settings.auth_cookie_name,
        value=create_access_token(user.id),
        httponly=True,
        secure=settings.auth_cookie_secure,
        samesite="lax",
        max_age=settings.access_token_expire_minutes * 60,
        path="/",
    )
    await audit_log_service.create_audit_log(
        db,
        AuditLogCreate(
            user_id=user.id,
            event_type="login_succeeded",
            source="user",
            target=user.username,
            request_text=user.username,
            status="success",
            metadata_json={"username": user.username},
        ),
    )
    return user


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(
    response: Response,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    response.delete_cookie(
        key=settings.auth_cookie_name,
        httponly=True,
        secure=settings.auth_cookie_secure,
        samesite="lax",
        path="/",
    )
    await audit_log_service.create_audit_log(
        db,
        AuditLogCreate(
            user_id=current_user.id,
            event_type="logout",
            source="user",
            target=current_user.username,
            status="success",
        ),
    )
