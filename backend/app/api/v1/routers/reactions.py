import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.core.database import get_db
from app.models.user import User
from app.models.reaction import AdverseReaction
from app.models.audit_log import AuditLog
from app.schemas.reaction import (
    ReactionCreate, ReactionUpdate, ReactionResponse, ReactionListResponse,
)
from app.api.v1.dependencies import get_current_user

router = APIRouter()


@router.get("/", response_model=ReactionListResponse)
async def list_reactions(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    search: str = Query(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    q = select(AdverseReaction).where(
        AdverseReaction.user_id == current_user.id,
        AdverseReaction.deleted_at.is_(None),
    )
    if search:
        q = q.where(AdverseReaction.substance.ilike(f"%{search}%"))
    total = (await db.execute(select(func.count()).select_from(q.subquery()))).scalar()
    items = (await db.execute(q.offset(skip).limit(limit))).scalars().all()
    return ReactionListResponse(items=items, total=total, skip=skip, limit=limit)


@router.post("/", response_model=ReactionResponse, status_code=201)
async def create_reaction(
    body: ReactionCreate,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    record = AdverseReaction(user_id=current_user.id, **body.model_dump())
    db.add(record)
    await db.flush()
    db.add(AuditLog(
        user_id=current_user.id, table_name="adverse_reactions", record_id=record.id,
        action="create", changed_fields=body.model_dump(mode="json"),
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
    ))
    await db.commit()
    await db.refresh(record)
    return record


@router.get("/{record_id}", response_model=ReactionResponse)
async def get_reaction(
    record_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(AdverseReaction).where(
        AdverseReaction.id == record_id,
        AdverseReaction.user_id == current_user.id,
        AdverseReaction.deleted_at.is_(None),
    ))
    record = result.scalar_one_or_none()
    if not record:
        raise HTTPException(status_code=404, detail="Not found")
    return record


@router.put("/{record_id}", response_model=ReactionResponse)
async def update_reaction(
    record_id: uuid.UUID,
    body: ReactionCreate,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(AdverseReaction).where(
        AdverseReaction.id == record_id,
        AdverseReaction.user_id == current_user.id,
        AdverseReaction.deleted_at.is_(None),
    ))
    record = result.scalar_one_or_none()
    if not record:
        raise HTTPException(status_code=404, detail="Not found")
    for k, v in body.model_dump().items():
        setattr(record, k, v)
    db.add(AuditLog(
        user_id=current_user.id, table_name="adverse_reactions", record_id=record.id,
        action="update", changed_fields=body.model_dump(mode="json"),
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
    ))
    await db.commit()
    await db.refresh(record)
    return record


@router.patch("/{record_id}", response_model=ReactionResponse)
async def patch_reaction(
    record_id: uuid.UUID,
    body: ReactionUpdate,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(AdverseReaction).where(
        AdverseReaction.id == record_id,
        AdverseReaction.user_id == current_user.id,
        AdverseReaction.deleted_at.is_(None),
    ))
    record = result.scalar_one_or_none()
    if not record:
        raise HTTPException(status_code=404, detail="Not found")
    update_data = body.model_dump(exclude_unset=True)
    for k, v in update_data.items():
        setattr(record, k, v)
    db.add(AuditLog(
        user_id=current_user.id, table_name="adverse_reactions", record_id=record.id,
        action="update", changed_fields=body.model_dump(mode="json", exclude_unset=True),
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
    ))
    await db.commit()
    await db.refresh(record)
    return record


@router.delete("/{record_id}", status_code=204)
async def delete_reaction(
    record_id: uuid.UUID,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(AdverseReaction).where(
        AdverseReaction.id == record_id,
        AdverseReaction.user_id == current_user.id,
        AdverseReaction.deleted_at.is_(None),
    ))
    record = result.scalar_one_or_none()
    if not record:
        raise HTTPException(status_code=404, detail="Not found")
    record.deleted_at = datetime.now(timezone.utc)
    db.add(AuditLog(
        user_id=current_user.id, table_name="adverse_reactions", record_id=record.id,
        action="delete",
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
    ))
    await db.commit()
