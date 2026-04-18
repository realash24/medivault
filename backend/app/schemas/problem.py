from pydantic import BaseModel
import uuid
from datetime import date, datetime
from typing import Optional, List


class ProblemBase(BaseModel):
    problem_name: str
    snomed_ct: Optional[str] = None
    icd10: Optional[str] = None
    severity: Optional[str] = None
    status: Optional[str] = "active"
    onset_date: Optional[date] = None
    resolution_date: Optional[date] = None
    clinical_notes: Optional[str] = None


class ProblemCreate(ProblemBase):
    pass


class ProblemUpdate(BaseModel):
    problem_name: Optional[str] = None
    snomed_ct: Optional[str] = None
    icd10: Optional[str] = None
    severity: Optional[str] = None
    status: Optional[str] = None
    onset_date: Optional[date] = None
    resolution_date: Optional[date] = None
    clinical_notes: Optional[str] = None


class ProblemResponse(ProblemBase):
    id: uuid.UUID
    user_id: uuid.UUID
    composition_uid: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ProblemListResponse(BaseModel):
    items: List[ProblemResponse]
    total: int
    skip: int
    limit: int
