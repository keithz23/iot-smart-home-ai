from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.core.security import verify_password
from backend.models.user import User


async def authenticate_user(
    db: AsyncSession,
    username: str,
    password: str,
) -> User | None:
    result = await db.execute(select(User).where(User.username == username))
    user = result.scalar_one_or_none()

    if user is None or not user.is_active:
        return None

    if not verify_password(password, user.password_hash):
        return None

    return user
        