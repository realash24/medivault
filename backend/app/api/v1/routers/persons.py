from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.user import User
from app.models.person import Person
from app.models.audit_log import AuditLog
from app.schemas.person import PersonUpdate, PersonResponse
from app.api.v1.dependencies import get_current_user

router = APIRouter()


@router.get("/me", response_model=PersonResponse)
async def get_my_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Person).where(
            Person.user_id == current_user.id,
            Person.deleted_at.is_(None),
        )
    )
    person = result.scalar_one_or_none()
    if not person:
        raise HTTPException(status_code=404, detail="Person profile not found")
    return person


@router.put("/me", response_model=PersonResponse)
async def update_my_profile(
    body: PersonUpdate,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Person).where(
            Person.user_id == current_user.id,
            Person.deleted_at.is_(None),
        )
    )
    person = result.scalar_one_or_none()
    if not person:
        raise HTTPException(status_code=404, detail="Person profile not found")

    update_data = body.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(person, field, value)

    db.add(AuditLog(
        user_id=current_user.id,
        table_name="persons",
        record_id=person.person_id,
        action="update",
        changed_fields=update_data,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
    ))
    await db.commit()
    await db.refresh(person)
    return person
