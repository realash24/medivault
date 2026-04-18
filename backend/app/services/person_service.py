"""Person service helpers."""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.person import Person
import uuid


async def get_person_by_user(db: AsyncSession, user_id: uuid.UUID):
    result = await db.execute(
        select(Person).where(Person.user_id == user_id, Person.deleted_at.is_(None))
    )
    return result.scalar_one_or_none()
