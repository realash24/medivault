from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.user import User
from app.models.person import Person
from app.models.problem import ProblemDiagnosis
from app.models.medication import MedicationOrder
from app.models.reaction import AdverseReaction
from app.models.vital_sign import VitalSign
from app.models.pathology_report import PathologyReport
from app.models.immunisation import Immunisation
from app.models.encounter import ClinicalEncounter
from app.models.document import ClinicalDocument
from app.api.v1.dependencies import get_current_user

router = APIRouter()


async def _collect_all(db: AsyncSession, user: User) -> dict:
    uid = user.id

    async def fetch(model):
        rows = (await db.execute(
            select(model).where(model.user_id == uid, model.deleted_at.is_(None))
        )).scalars().all()
        return rows

    person_result = await db.execute(
        select(Person).where(Person.user_id == uid, Person.deleted_at.is_(None))
    )
    person = person_result.scalar_one_or_none()

    def to_dict(obj):
        d = {}
        for col in obj.__table__.columns:
            val = getattr(obj, col.name)
            if hasattr(val, "isoformat"):
                val = val.isoformat()
            d[col.name] = val
        return d

    return {
        "person": to_dict(person) if person else None,
        "problems": [to_dict(r) for r in await fetch(ProblemDiagnosis)],
        "medications": [to_dict(r) for r in await fetch(MedicationOrder)],
        "reactions": [to_dict(r) for r in await fetch(AdverseReaction)],
        "vitals": [to_dict(r) for r in await fetch(VitalSign)],
        "pathology_reports": [to_dict(r) for r in await fetch(PathologyReport)],
        "immunisations": [to_dict(r) for r in await fetch(Immunisation)],
        "encounters": [to_dict(r) for r in await fetch(ClinicalEncounter)],
        "documents": [to_dict(r) for r in await fetch(ClinicalDocument)],
    }


@router.get("/json")
async def export_json(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    data = await _collect_all(db, current_user)
    return JSONResponse(
        content=data,
        headers={"Content-Disposition": "attachment; filename=medivault_export.json"},
    )


@router.get("/summary-pdf")
async def export_summary_pdf(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    data = await _collect_all(db, current_user)
    from app.utils.pdf_generator import generate_summary_pdf

    pdf_bytes = generate_summary_pdf(data)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=medivault_summary.pdf"},
    )
