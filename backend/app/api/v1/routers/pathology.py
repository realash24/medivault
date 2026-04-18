import uuid
import io
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, Request, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.core.database import get_db
from app.models.user import User
from app.models.pathology_report import PathologyReport
from app.models.audit_log import AuditLog
from app.schemas.pathology_report import (
    PathologyCreate, PathologyUpdate, PathologyResponse, PathologyListResponse,
)
from app.api.v1.dependencies import get_current_user

router = APIRouter()


@router.get("/", response_model=PathologyListResponse)
async def list_pathology(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    search: str = Query(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    q = select(PathologyReport).where(
        PathologyReport.user_id == current_user.id,
        PathologyReport.deleted_at.is_(None),
    )
    if search:
        q = q.where(PathologyReport.report_name.ilike(f"%{search}%"))
    q = q.order_by(PathologyReport.report_date.desc())
    total = (await db.execute(select(func.count()).select_from(q.subquery()))).scalar()
    items = (await db.execute(q.offset(skip).limit(limit))).scalars().all()
    return PathologyListResponse(items=items, total=total, skip=skip, limit=limit)


@router.post("/", response_model=PathologyResponse, status_code=201)
async def create_pathology(
    body: PathologyCreate,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    record = PathologyReport(user_id=current_user.id, **body.model_dump())
    db.add(record)
    await db.flush()
    db.add(AuditLog(
        user_id=current_user.id, table_name="pathology_reports", record_id=record.id,
        action="create", changed_fields=body.model_dump(mode="json"),
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
    ))
    await db.commit()
    await db.refresh(record)
    return record


@router.post("/upload-pdf", response_model=PathologyResponse, status_code=201)
async def upload_pathology_pdf(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    content = await file.read()
    from app.utils.pdf_extractor import extract_pathology_pdf
    from app.services.storage_service import upload_file

    extracted = extract_pathology_pdf(io.BytesIO(content))
    file_path = f"pathology/{current_user.id}/{file.filename}"
    file_url = await upload_file(file_path, content, file.content_type or "application/pdf")

    record = PathologyReport(
        user_id=current_user.id,
        report_name=extracted.get("report_name") or file.filename or "Pathology Report",
        lab_name=extracted.get("lab_name"),
        report_date=extracted.get("report_date"),
        results=extracted.get("results", []),
        pdf_file_url=file_url,
        pdf_file_path=file_path,
    )
    db.add(record)
    await db.commit()
    await db.refresh(record)
    return record


@router.get("/{record_id}", response_model=PathologyResponse)
async def get_pathology(
    record_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(PathologyReport).where(
        PathologyReport.id == record_id,
        PathologyReport.user_id == current_user.id,
        PathologyReport.deleted_at.is_(None),
    ))
    record = result.scalar_one_or_none()
    if not record:
        raise HTTPException(status_code=404, detail="Not found")
    return record


@router.put("/{record_id}", response_model=PathologyResponse)
async def update_pathology(
    record_id: uuid.UUID,
    body: PathologyCreate,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(PathologyReport).where(
        PathologyReport.id == record_id,
        PathologyReport.user_id == current_user.id,
        PathologyReport.deleted_at.is_(None),
    ))
    record = result.scalar_one_or_none()
    if not record:
        raise HTTPException(status_code=404, detail="Not found")
    for k, v in body.model_dump().items():
        setattr(record, k, v)
    db.add(AuditLog(
        user_id=current_user.id, table_name="pathology_reports", record_id=record.id,
        action="update", changed_fields=body.model_dump(mode="json"),
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
    ))
    await db.commit()
    await db.refresh(record)
    return record


@router.patch("/{record_id}", response_model=PathologyResponse)
async def patch_pathology(
    record_id: uuid.UUID,
    body: PathologyUpdate,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(PathologyReport).where(
        PathologyReport.id == record_id,
        PathologyReport.user_id == current_user.id,
        PathologyReport.deleted_at.is_(None),
    ))
    record = result.scalar_one_or_none()
    if not record:
        raise HTTPException(status_code=404, detail="Not found")
    update_data = body.model_dump(exclude_unset=True)
    for k, v in update_data.items():
        setattr(record, k, v)
    db.add(AuditLog(
        user_id=current_user.id, table_name="pathology_reports", record_id=record.id,
        action="update", changed_fields=body.model_dump(mode="json", exclude_unset=True),
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
    ))
    await db.commit()
    await db.refresh(record)
    return record


@router.delete("/{record_id}", status_code=204)
async def delete_pathology(
    record_id: uuid.UUID,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(PathologyReport).where(
        PathologyReport.id == record_id,
        PathologyReport.user_id == current_user.id,
        PathologyReport.deleted_at.is_(None),
    ))
    record = result.scalar_one_or_none()
    if not record:
        raise HTTPException(status_code=404, detail="Not found")
    record.deleted_at = datetime.now(timezone.utc)
    db.add(AuditLog(
        user_id=current_user.id, table_name="pathology_reports", record_id=record.id,
        action="delete",
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
    ))
    await db.commit()
