import uuid
from datetime import datetime
from sqlalchemy import Boolean, String, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String, unique=True, nullable=False, index=True)
    hashed_password: Mapped[str] = mapped_column(String, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    person = relationship("Person", back_populates="user", uselist=False)
    problems = relationship("ProblemDiagnosis", back_populates="user")
    medications = relationship("MedicationOrder", back_populates="user")
    reactions = relationship("AdverseReaction", back_populates="user")
    vitals = relationship("VitalSign", back_populates="user")
    pathology_reports = relationship("PathologyReport", back_populates="user")
    immunisations = relationship("Immunisation", back_populates="user")
    encounters = relationship("ClinicalEncounter", back_populates="user")
    documents = relationship("ClinicalDocument", back_populates="user")
    audit_logs = relationship("AuditLog", back_populates="user")
