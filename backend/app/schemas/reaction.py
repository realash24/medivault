from pydantic import BaseModel
import uuid
from datetime import date, datetime
from typing import Optional, List


class ReactionBase(BaseModel):
    substance: str
    substance_type: Optional[str] = None
    reaction_type: Optional[str] = None
    manifestation: Optional[str] = None
    severity: Optional[str] = None
    criticality: Optional[str] = None
    verification_status: Optional[str] = "unconfirmed"
    onset_date: Optional[date] = None
    notes: Optional[str] = None


class ReactionCreate(ReactionBase):
    pass


class ReactionUpdate(BaseModel):
    substance: Optional[str] = None
    substance_type: Optional[str] = None
    reaction_type: Optional[str] = None
    manifestation: Optional[str] = None
    severity: Optional[str] = None
    criticality: Optional[str] = None
    verification_status: Optional[str] = None
    onset_date: Optional[date] = None
    notes: Optional[str] = None


class ReactionResponse(ReactionBase):
    id: uuid.UUID
    user_id: uuid.UUID
    composition_uid: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ReactionListResponse(BaseModel):
    items: List[ReactionResponse]
    total: int
    skip: int
    limit: int
