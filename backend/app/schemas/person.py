from pydantic import BaseModel
import uuid
from datetime import date, datetime
from typing import Optional


class PersonBase(BaseModel):
    family_name: str
    given_names: str
    dob: Optional[date] = None
    sex: Optional[str] = None
    blood_type: Optional[str] = None
    address_line1: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    postcode: Optional[str] = None
    phone: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None


class PersonCreate(PersonBase):
    pass


class PersonUpdate(BaseModel):
    family_name: Optional[str] = None
    given_names: Optional[str] = None
    dob: Optional[date] = None
    sex: Optional[str] = None
    blood_type: Optional[str] = None
    address_line1: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    postcode: Optional[str] = None
    phone: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None


class PersonResponse(PersonBase):
    person_id: uuid.UUID
    user_id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
