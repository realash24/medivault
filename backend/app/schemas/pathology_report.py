from pydantic import BaseModel
import uuid
from datetime import date, datetime
from typing import Optional, List, Any


class PathologyResult(BaseModel):
    analyte: Optional[str] = None
    value: Optional[str] = None
    unit: Optional[str] = None
    ref_range_low: Optional[str] = None
    ref_range_high: Optional[str] = None
    flag: Optional[str] = None


class PathologyBase(BaseModel):
    report_name: str
    lab_name: Optional[str] = None
    panel_type: Optional[str] = None
    report_date: Optional[date] = None
    results: Optional[List[Any]] = None
    pdf_file_url: Optional[str] = None
    pdf_file_path: Optional[str] = None
    ordering_provider: Optional[str] = None
    notes: Optional[str] = None


class PathologyCreate(PathologyBase):
    pass


class PathologyUpdate(BaseModel):
    report_name: Optional[str] = None
    lab_name: Optional[str] = None
    panel_type: Optional[str] = None
    report_date: Optional[date] = None
    results: Optional[List[Any]] = None
    pdf_file_url: Optional[str] = None
    pdf_file_path: Optional[str] = None
    ordering_provider: Optional[str] = None
    notes: Optional[str] = None


class PathologyResponse(PathologyBase):
    id: uuid.UUID
    user_id: uuid.UUID
    composition_uid: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class PathologyListResponse(BaseModel):
    items: List[PathologyResponse]
    total: int
    skip: int
    limit: int
