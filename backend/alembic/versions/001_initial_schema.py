"""Initial schema

Revision ID: 001
Revises:
Create Date: 2024-01-01 00:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("email", sa.String(), nullable=False, unique=True),
        sa.Column("hashed_password", sa.String(), nullable=False),
        sa.Column("is_active", sa.Boolean(), default=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_users_email", "users", ["email"])

    op.create_table(
        "persons",
        sa.Column("person_id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True),
        sa.Column("family_name", sa.String(), nullable=False),
        sa.Column("given_names", sa.String(), nullable=False),
        sa.Column("dob", sa.Date()),
        sa.Column("sex", sa.String(20)),
        sa.Column("blood_type", sa.String(10)),
        sa.Column("address_line1", sa.String()),
        sa.Column("city", sa.String()),
        sa.Column("state", sa.String()),
        sa.Column("country", sa.String()),
        sa.Column("postcode", sa.String(20)),
        sa.Column("phone", sa.String(50)),
        sa.Column("emergency_contact_name", sa.String()),
        sa.Column("emergency_contact_phone", sa.String(50)),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("deleted_at", sa.DateTime(timezone=True)),
    )

    op.create_table(
        "problem_diagnoses",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("composition_uid", postgresql.UUID(as_uuid=True)),
        sa.Column("problem_name", sa.String(), nullable=False),
        sa.Column("snomed_ct", sa.String()),
        sa.Column("icd10", sa.String()),
        sa.Column("severity", sa.String(20)),
        sa.Column("status", sa.String(20), default="active"),
        sa.Column("onset_date", sa.Date()),
        sa.Column("resolution_date", sa.Date()),
        sa.Column("clinical_notes", sa.Text()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("deleted_at", sa.DateTime(timezone=True)),
    )
    op.create_index("ix_problem_diagnoses_user_id", "problem_diagnoses", ["user_id"])

    op.create_table(
        "medication_orders",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("composition_uid", postgresql.UUID(as_uuid=True)),
        sa.Column("medication_name", sa.String(), nullable=False),
        sa.Column("generic_name", sa.String()),
        sa.Column("route", sa.String()),
        sa.Column("dose", sa.String()),
        sa.Column("frequency", sa.String()),
        sa.Column("start_date", sa.Date()),
        sa.Column("end_date", sa.Date()),
        sa.Column("status", sa.String(20), default="active"),
        sa.Column("prescriber", sa.String()),
        sa.Column("indication", sa.String()),
        sa.Column("notes", sa.Text()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("deleted_at", sa.DateTime(timezone=True)),
    )
    op.create_index("ix_medication_orders_user_id", "medication_orders", ["user_id"])

    op.create_table(
        "adverse_reactions",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("composition_uid", postgresql.UUID(as_uuid=True)),
        sa.Column("substance", sa.String(), nullable=False),
        sa.Column("substance_type", sa.String(30)),
        sa.Column("reaction_type", sa.String(30)),
        sa.Column("manifestation", sa.Text()),
        sa.Column("severity", sa.String(30)),
        sa.Column("criticality", sa.String(30)),
        sa.Column("verification_status", sa.String(20), default="unconfirmed"),
        sa.Column("onset_date", sa.Date()),
        sa.Column("notes", sa.Text()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("deleted_at", sa.DateTime(timezone=True)),
    )
    op.create_index("ix_adverse_reactions_user_id", "adverse_reactions", ["user_id"])

    op.create_table(
        "vital_signs",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("composition_uid", postgresql.UUID(as_uuid=True)),
        sa.Column("observation_type", sa.String(), nullable=False),
        sa.Column("value_numeric", sa.Float()),
        sa.Column("value_numeric_2", sa.Float()),
        sa.Column("value_unit", sa.String(50)),
        sa.Column("observation_datetime", sa.DateTime(timezone=True), nullable=False),
        sa.Column("notes", sa.Text()),
        sa.Column("device", sa.String()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("deleted_at", sa.DateTime(timezone=True)),
    )
    op.create_index("ix_vital_signs_user_id", "vital_signs", ["user_id"])

    op.create_table(
        "pathology_reports",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("composition_uid", postgresql.UUID(as_uuid=True)),
        sa.Column("report_name", sa.String(), nullable=False),
        sa.Column("lab_name", sa.String()),
        sa.Column("panel_type", sa.String()),
        sa.Column("report_date", sa.Date()),
        sa.Column("results", postgresql.JSONB()),
        sa.Column("pdf_file_url", sa.String()),
        sa.Column("pdf_file_path", sa.String()),
        sa.Column("ordering_provider", sa.String()),
        sa.Column("notes", sa.Text()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("deleted_at", sa.DateTime(timezone=True)),
    )
    op.create_index("ix_pathology_reports_user_id", "pathology_reports", ["user_id"])

    op.create_table(
        "immunisations",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("composition_uid", postgresql.UUID(as_uuid=True)),
        sa.Column("vaccine_name", sa.String(), nullable=False),
        sa.Column("disease_targeted", sa.String()),
        sa.Column("administration_date", sa.Date()),
        sa.Column("batch_number", sa.String()),
        sa.Column("dose_number", sa.Integer()),
        sa.Column("next_due_date", sa.Date()),
        sa.Column("administrator", sa.String()),
        sa.Column("site", sa.String()),
        sa.Column("notes", sa.Text()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("deleted_at", sa.DateTime(timezone=True)),
    )
    op.create_index("ix_immunisations_user_id", "immunisations", ["user_id"])

    op.create_table(
        "clinical_encounters",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("composition_uid", postgresql.UUID(as_uuid=True)),
        sa.Column("encounter_type", sa.String(30)),
        sa.Column("encounter_date", sa.Date(), nullable=False),
        sa.Column("provider_name", sa.String()),
        sa.Column("provider_specialty", sa.String()),
        sa.Column("facility", sa.String()),
        sa.Column("chief_complaint", sa.Text()),
        sa.Column("assessment", sa.Text()),
        sa.Column("plan", sa.Text()),
        sa.Column("notes", sa.Text()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("deleted_at", sa.DateTime(timezone=True)),
    )
    op.create_index("ix_clinical_encounters_user_id", "clinical_encounters", ["user_id"])

    op.create_table(
        "clinical_documents",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("composition_uid", postgresql.UUID(as_uuid=True)),
        sa.Column("document_type", sa.String(50)),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("description", sa.Text()),
        sa.Column("file_url", sa.String()),
        sa.Column("file_path", sa.String()),
        sa.Column("file_type", sa.String(50)),
        sa.Column("file_size", sa.Integer()),
        sa.Column("document_date", sa.Date()),
        sa.Column("source", sa.String()),
        sa.Column("tags", sa.ARRAY(sa.String())),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("deleted_at", sa.DateTime(timezone=True)),
    )
    op.create_index("ix_clinical_documents_user_id", "clinical_documents", ["user_id"])

    op.create_table(
        "audit_logs",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("table_name", sa.String()),
        sa.Column("record_id", postgresql.UUID(as_uuid=True)),
        sa.Column("action", sa.String(20)),
        sa.Column("changed_fields", postgresql.JSONB()),
        sa.Column("ip_address", sa.String(50)),
        sa.Column("user_agent", sa.String()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )


def downgrade() -> None:
    op.drop_table("audit_logs")
    op.drop_table("clinical_documents")
    op.drop_table("clinical_encounters")
    op.drop_table("immunisations")
    op.drop_table("pathology_reports")
    op.drop_table("vital_signs")
    op.drop_table("adverse_reactions")
    op.drop_table("medication_orders")
    op.drop_table("problem_diagnoses")
    op.drop_table("persons")
    op.drop_table("users")
