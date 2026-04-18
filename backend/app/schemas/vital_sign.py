from pydantic import BaseModel
import uuid
from datetime import datetime
from typing import Optional, List


class VitalSignBase(BaseModel):
    observation_type: str
    value_numeric: Optional[float] = None
    value_numeric_2: Optional[float] = None
    value_unit: Optional[str] = None
    observation_datetime: datetime
    notes: Optional[str] = None
    device: Optional[str] = None


class VitalSignCreate(VitalSignBase):
    pass


class VitalSignUpdate(BaseModel):
    observation_type: Optional[str] = None
    value_numeric: Optional[float] = None
    value_numeric_2: Optional[float] = None
    value_unit: Optional[str] = None
    observation_datetime: Optional[datetime] = None
    notes: Optional[str] = None
    device: Optional[str] = None


class VitalSignResponse(VitalSignBase):
    id: uuid.UUID
    user_id: uuid.UUID
    composition_uid: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class VitalSignListResponse(BaseModel):
    items: List[VitalSignResponse]
    total: int
    skip: int
    limit: int
