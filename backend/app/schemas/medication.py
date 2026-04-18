from pydantic import BaseModel
import uuid
from datetime import date, datetime
from typing import Optional, List


class MedicationBase(BaseModel):
    medication_name: str
    generic_name: Optional[str] = None
    route: Optional[str] = None
    dose: Optional[str] = None
    frequency: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    status: Optional[str] = "active"
    prescriber: Optional[str] = None
    indication: Optional[str] = None
    notes: Optional[str] = None


class MedicationCreate(MedicationBase):
    pass


class MedicationUpdate(BaseModel):
    medication_name: Optional[str] = None
    generic_name: Optional[str] = None
    route: Optional[str] = None
    dose: Optional[str] = None
    frequency: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    status: Optional[str] = None
    prescriber: Optional[str] = None
    indication: Optional[str] = None
    notes: Optional[str] = None


class MedicationResponse(MedicationBase):
    id: uuid.UUID
    user_id: uuid.UUID
    composition_uid: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class MedicationListResponse(BaseModel):
    items: List[MedicationResponse]
    total: int
    skip: int
    limit: int
