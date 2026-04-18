from pydantic import BaseModel
import uuid
from datetime import date, datetime
from typing import Optional, List


class EncounterBase(BaseModel):
    encounter_type: Optional[str] = None
    encounter_date: date
    provider_name: Optional[str] = None
    provider_specialty: Optional[str] = None
    facility: Optional[str] = None
    chief_complaint: Optional[str] = None
    assessment: Optional[str] = None
    plan: Optional[str] = None
    notes: Optional[str] = None


class EncounterCreate(EncounterBase):
    pass


class EncounterUpdate(BaseModel):
    encounter_type: Optional[str] = None
    encounter_date: Optional[date] = None
    provider_name: Optional[str] = None
    provider_specialty: Optional[str] = None
    facility: Optional[str] = None
    chief_complaint: Optional[str] = None
    assessment: Optional[str] = None
    plan: Optional[str] = None
    notes: Optional[str] = None


class EncounterResponse(EncounterBase):
    id: uuid.UUID
    user_id: uuid.UUID
    composition_uid: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class EncounterListResponse(BaseModel):
    items: List[EncounterResponse]
    total: int
    skip: int
    limit: int
