from pydantic import BaseModel
import uuid
from datetime import date, datetime
from typing import Optional, List


class DocumentBase(BaseModel):
    document_type: Optional[str] = None
    title: str
    description: Optional[str] = None
    file_url: Optional[str] = None
    file_path: Optional[str] = None
    file_type: Optional[str] = None
    file_size: Optional[int] = None
    document_date: Optional[date] = None
    source: Optional[str] = None
    tags: Optional[List[str]] = None


class DocumentCreate(DocumentBase):
    pass


class DocumentUpdate(BaseModel):
    document_type: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    file_url: Optional[str] = None
    file_path: Optional[str] = None
    file_type: Optional[str] = None
    file_size: Optional[int] = None
    document_date: Optional[date] = None
    source: Optional[str] = None
    tags: Optional[List[str]] = None


class DocumentResponse(DocumentBase):
    id: uuid.UUID
    user_id: uuid.UUID
    composition_uid: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class DocumentListResponse(BaseModel):
    items: List[DocumentResponse]
    total: int
    skip: int
    limit: int
