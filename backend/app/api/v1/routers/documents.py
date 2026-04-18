import uuid
from datetime import datetime, timezone, date as date_type
from fastapi import APIRouter, Depends, HTTPException, Query, Request, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.core.database import get_db
from app.models.user import User
from app.models.document import ClinicalDocument
from app.models.audit_log import AuditLog
from app.schemas.document import (
    DocumentCreate, DocumentUpdate, DocumentResponse, DocumentListResponse,
)
from app.api.v1.dependencies import get_current_user
from typing import Optional

router = APIRouter()


@router.get("/", response_model=DocumentListResponse)
async def list_documents(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    search: str = Query(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    q = select(ClinicalDocument).where(
        ClinicalDocument.user_id == current_user.id,
        ClinicalDocument.deleted_at.is_(None),
    )
    if search:
        q = q.where(ClinicalDocument.title.ilike(f"%{search}%"))
    q = q.order_by(ClinicalDocument.created_at.desc())
    total = (await db.execute(select(func.count()).select_from(q.subquery()))).scalar()
    items = (await db.execute(q.offset(skip).limit(limit))).scalars().all()
    return DocumentListResponse(items=items, total=total, skip=skip, limit=limit)


@router.post("/", response_model=DocumentResponse, status_code=201)
async def create_document(
    body: DocumentCreate,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    record = ClinicalDocument(user_id=current_user.id, **body.model_dump())
    db.add(record)
    await db.flush()
    db.add(AuditLog(
        user_id=current_user.id, table_name="clinical_documents", record_id=record.id,
        action="create", changed_fields=body.model_dump(mode="json"),
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
    ))
    await db.commit()
    await db.refresh(record)
    return record


@router.post("/upload", response_model=DocumentResponse, status_code=201)
async def upload_document(
    file: UploadFile = File(...),
    title: str = Form(...),
    document_type: Optional[str] = Form(None),
    document_date: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    content = await file.read()
    from app.services.storage_service import upload_file

    file_path = f"documents/{current_user.id}/{file.filename}"
    file_url = await upload_file(file_path, content, file.content_type or "application/octet-stream")

    doc_date = None
    if document_date:
        try:
            doc_date = date_type.fromisoformat(document_date)
        except ValueError:
            pass

    record = ClinicalDocument(
        user_id=current_user.id,
        title=title,
        document_type=document_type,
        document_date=doc_date,
        file_url=file_url,
        file_path=file_path,
        file_type=file.content_type,
        file_size=len(content),
    )
    db.add(record)
    await db.commit()
    await db.refresh(record)
    return record


@router.get("/{record_id}", response_model=DocumentResponse)
async def get_document(
    record_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(ClinicalDocument).where(
        ClinicalDocument.id == record_id,
        ClinicalDocument.user_id == current_user.id,
        ClinicalDocument.deleted_at.is_(None),
    ))
    record = result.scalar_one_or_none()
    if not record:
        raise HTTPException(status_code=404, detail="Not found")
    return record


@router.put("/{record_id}", response_model=DocumentResponse)
async def update_document(
    record_id: uuid.UUID,
    body: DocumentCreate,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(ClinicalDocument).where(
        ClinicalDocument.id == record_id,
        ClinicalDocument.user_id == current_user.id,
        ClinicalDocument.deleted_at.is_(None),
    ))
    record = result.scalar_one_or_none()
    if not record:
        raise HTTPException(status_code=404, detail="Not found")
    for k, v in body.model_dump().items():
        setattr(record, k, v)
    db.add(AuditLog(
        user_id=current_user.id, table_name="clinical_documents", record_id=record.id,
        action="update", changed_fields=body.model_dump(mode="json"),
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
    ))
    await db.commit()
    await db.refresh(record)
    return record


@router.patch("/{record_id}", response_model=DocumentResponse)
async def patch_document(
    record_id: uuid.UUID,
    body: DocumentUpdate,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(ClinicalDocument).where(
        ClinicalDocument.id == record_id,
        ClinicalDocument.user_id == current_user.id,
        ClinicalDocument.deleted_at.is_(None),
    ))
    record = result.scalar_one_or_none()
    if not record:
        raise HTTPException(status_code=404, detail="Not found")
    update_data = body.model_dump(exclude_unset=True)
    for k, v in update_data.items():
        setattr(record, k, v)
    db.add(AuditLog(
        user_id=current_user.id, table_name="clinical_documents", record_id=record.id,
        action="update", changed_fields=body.model_dump(mode="json", exclude_unset=True),
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
    ))
    await db.commit()
    await db.refresh(record)
    return record


@router.delete("/{record_id}", status_code=204)
async def delete_document(
    record_id: uuid.UUID,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(ClinicalDocument).where(
        ClinicalDocument.id == record_id,
        ClinicalDocument.user_id == current_user.id,
        ClinicalDocument.deleted_at.is_(None),
    ))
    record = result.scalar_one_or_none()
    if not record:
        raise HTTPException(status_code=404, detail="Not found")
    record.deleted_at = datetime.now(timezone.utc)
    db.add(AuditLog(
        user_id=current_user.id, table_name="clinical_documents", record_id=record.id,
        action="delete",
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
    ))
    await db.commit()
