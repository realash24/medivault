import uuid
from datetime import date, datetime
from sqlalchemy import String, Date, DateTime, ForeignKey, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import Optional
from app.core.database import Base


class ProblemDiagnosis(Base):
    __tablename__ = "problem_diagnoses"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    composition_uid: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), default=uuid.uuid4)
    problem_name: Mapped[str] = mapped_column(String, nullable=False)
    snomed_ct: Mapped[Optional[str]] = mapped_column(String)
    icd10: Mapped[Optional[str]] = mapped_column(String)
    severity: Mapped[Optional[str]] = mapped_column(String(20))
    status: Mapped[Optional[str]] = mapped_column(String(20), default="active")
    onset_date: Mapped[Optional[date]] = mapped_column(Date)
    resolution_date: Mapped[Optional[date]] = mapped_column(Date)
    clinical_notes: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    deleted_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))

    user = relationship("User", back_populates="problems")
