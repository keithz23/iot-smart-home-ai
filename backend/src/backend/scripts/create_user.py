import argparse
import asyncio
from getpass import getpass

from sqlalchemy import select

from backend.core.security import hash_password
from backend.databases.databases import AsyncSessionLocal
from backend.models.user import User


async def create_user(username: str, password: str) -> None:
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(User).where(User.username == username))
        if result.scalar_one_or_none() is not None:
            raise ValueError(f"User already exists: {username}")

        user = User(
            username=username,
            password_hash=hash_password(password),
            is_active=True,
        )
        db.add(user)
        await db.commit()
        print(f"Created user: {username}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Create a dashboard user")
    parser.add_argument("username", help="Username used to log in")
    args = parser.parse_args()
    password = getpass("Password: ")
    confirmation = getpass("Confirm password: ")
    if password != confirmation:
        parser.error("Passwords do not match")
    asyncio.run(create_user(args.username, password))


if __name__ == "__main__":
    main()
