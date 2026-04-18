import uuid
from datetime import date, datetime
from sqlalchemy import String, Date, DateTime, ForeignKey, Text, Integer, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import Optional
from app.core.database import Base


class Immunisation(Base):
    __tablename__ = "immunisations"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    composition_uid: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), default=uuid.uuid4)
    vaccine_name: Mapped[str] = mapped_column(String, nullable=False)
    disease_targeted: Mapped[Optional[str]] = mapped_column(String)
    administration_date: Mapped[Optional[date]] = mapped_column(Date)
    batch_number: Mapped[Optional[str]] = mapped_column(String)
    dose_number: Mapped[Optional[int]] = mapped_column(Integer)
    next_due_date: Mapped[Optional[date]] = mapped_column(Date)
    administrator: Mapped[Optional[str]] = mapped_column(String)
    site: Mapped[Optional[str]] = mapped_column(String)
    notes: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    deleted_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))

    user = relationship("User", back_populates="immunisations")
