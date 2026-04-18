from pydantic import BaseModel
import uuid
from datetime import date, datetime
from typing import Optional, List


class ImmunisationBase(BaseModel):
    vaccine_name: str
    disease_targeted: Optional[str] = None
    administration_date: Optional[date] = None
    batch_number: Optional[str] = None
    dose_number: Optional[int] = None
    next_due_date: Optional[date] = None
    administrator: Optional[str] = None
    site: Optional[str] = None
    notes: Optional[str] = None


class ImmunisationCreate(ImmunisationBase):
    pass


class ImmunisationUpdate(BaseModel):
    vaccine_name: Optional[str] = None
    disease_targeted: Optional[str] = None
    administration_date: Optional[date] = None
    batch_number: Optional[str] = None
    dose_number: Optional[int] = None
    next_due_date: Optional[date] = None
    administrator: Optional[str] = None
    site: Optional[str] = None
    notes: Optional[str] = None


class ImmunisationResponse(ImmunisationBase):
    id: uuid.UUID
    user_id: uuid.UUID
    composition_uid: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ImmunisationListResponse(BaseModel):
    items: List[ImmunisationResponse]
    total: int
    skip: int
    limit: int
