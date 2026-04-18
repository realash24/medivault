import uuid
from datetime import date, datetime
from sqlalchemy import String, Date, DateTime, ForeignKey, Text, func
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import Any, List, Optional
from app.core.database import Base


class PathologyReport(Base):
    __tablename__ = "pathology_reports"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    composition_uid: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), default=uuid.uuid4)
    report_name: Mapped[str] = mapped_column(String, nullable=False)
    lab_name: Mapped[Optional[str]] = mapped_column(String)
    panel_type: Mapped[Optional[str]] = mapped_column(String)
    report_date: Mapped[Optional[date]] = mapped_column(Date)
    results: Mapped[Optional[List[Any]]] = mapped_column(JSONB)
    pdf_file_url: Mapped[Optional[str]] = mapped_column(String)
    pdf_file_path: Mapped[Optional[str]] = mapped_column(String)
    ordering_provider: Mapped[Optional[str]] = mapped_column(String)
    notes: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    deleted_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))

    user = relationship("User", back_populates="pathology_reports")
