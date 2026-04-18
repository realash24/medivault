import uuid
from datetime import date, datetime
from sqlalchemy import String, Date, DateTime, ForeignKey, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import Optional
from app.core.database import Base


class ClinicalEncounter(Base):
    __tablename__ = "clinical_encounters"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    composition_uid: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), default=uuid.uuid4)
    encounter_type: Mapped[Optional[str]] = mapped_column(String(30))
    encounter_date: Mapped[date] = mapped_column(Date, nullable=False)
    provider_name: Mapped[Optional[str]] = mapped_column(String)
    provider_specialty: Mapped[Optional[str]] = mapped_column(String)
    facility: Mapped[Optional[str]] = mapped_column(String)
    chief_complaint: Mapped[Optional[str]] = mapped_column(Text)
    assessment: Mapped[Optional[str]] = mapped_column(Text)
    plan: Mapped[Optional[str]] = mapped_column(Text)
    notes: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    deleted_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))

    user = relationship("User", back_populates="encounters")
