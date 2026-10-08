from datetime import datetime, timedelta, timezone

import jwt
from pwdlib import PasswordHash

from backend.core.config import settings


password_hash = PasswordHash.recommended()


def hash_password(value: str) -> str:
    return password_hash.hash(value)


def verify_password(value: str, hashed_value: str) -> bool:
    return password_hash.verify(value, hashed_value)


def create_access_token(user_id: int) -> str:
    expires_at = datetime.now(timezone.utc) + timedelta(
        minutes=settings.access_token_expire_minutes
    )
    payload = {
        "sub": str(user_id),
        "type": "access",
        "exp": expires_at,
    }
    return jwt.encode(
        payload,
        settings.jwt_secret_key,
        algorithm=settings.jwt_algorithm,
    )


def decode_access_token(token: str) -> int | None:
    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm],
        )
    except jwt.InvalidTokenError:
        return None

    if payload.get("type") != "access":
        return None

    subject = payload.get("sub")
    try:
        return int(subject)
    except (TypeError, ValueError):
        return None