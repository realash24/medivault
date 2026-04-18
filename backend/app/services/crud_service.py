"""Generic async CRUD helpers."""
from typing import Any, Dict, Optional, Type, TypeVar
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import Base
import uuid

ModelT = TypeVar("ModelT", bound=Base)


async def get_by_id(db: AsyncSession, model: Type[ModelT], record_id: uuid.UUID) -> Optional[ModelT]:
    result = await db.execute(select(model).where(model.id == record_id))
    return result.scalar_one_or_none()


async def soft_delete(db: AsyncSession, record: Any) -> None:
    from datetime import datetime, timezone
    record.deleted_at = datetime.now(timezone.utc)
    await db.commit()
