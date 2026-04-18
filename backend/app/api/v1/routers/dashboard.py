from datetime import date, datetime, timezone, timedelta
from typing import List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from app.core.database import get_db
from app.models.user import User
from app.models.problem import ProblemDiagnosis
from app.models.medication import MedicationOrder
from app.models.reaction import AdverseReaction
from app.models.vital_sign import VitalSign
from app.models.pathology_report import PathologyReport
from app.models.immunisation import Immunisation
from app.models.encounter import ClinicalEncounter
from app.models.document import ClinicalDocument
from app.schemas.dashboard import (
    DashboardSummary, VitalsTrendResponse, VitalsTrendPoint,
    PathologyTrendPoint, TimelineEvent,
)
from app.api.v1.dependencies import get_current_user

router = APIRouter()


@router.get("/summary", response_model=DashboardSummary)
async def dashboard_summary(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    uid = current_user.id

    async def count(model, *extra_filters):
        q = select(func.count()).where(
            model.user_id == uid,
            model.deleted_at.is_(None),
            *extra_filters,
        )
        return (await db.execute(q)).scalar() or 0

    today = date.today()
    thirty_days_ago = datetime.now(timezone.utc) - timedelta(days=30)

    active_problems = await count(ProblemDiagnosis, ProblemDiagnosis.status == "active")
    active_meds = await count(MedicationOrder, MedicationOrder.status == "active")
    reactions = await count(AdverseReaction)
    recent_vitals = await count(VitalSign, VitalSign.created_at >= thirty_days_ago)
    path_reports = await count(PathologyReport)
    immunisations = await count(Immunisation)
    upcoming_imm = await count(Immunisation, Immunisation.next_due_date >= today)
    recent_encounters = await count(
        ClinicalEncounter,
        ClinicalEncounter.encounter_date >= (today - timedelta(days=365)),
    )
    docs = await count(ClinicalDocument)

    return DashboardSummary(
        active_problems=active_problems,
        active_medications=active_meds,
        adverse_reactions=reactions,
        recent_vitals_count=recent_vitals,
        pathology_reports_count=path_reports,
        immunisations_count=immunisations,
        upcoming_immunisations=upcoming_imm,
        recent_encounters_count=recent_encounters,
        documents_count=docs,
    )


@router.get("/vitals-trend", response_model=VitalsTrendResponse)
async def vitals_trend(
    observation_type: str = Query(...),
    limit: int = Query(30, ge=1, le=200),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    q = (
        select(VitalSign)
        .where(
            VitalSign.user_id == current_user.id,
            VitalSign.deleted_at.is_(None),
            VitalSign.observation_type.ilike(observation_type),
        )
        .order_by(VitalSign.observation_datetime.asc())
        .limit(limit)
    )
    rows = (await db.execute(q)).scalars().all()
    data = [
        VitalsTrendPoint(
            datetime=r.observation_datetime,
            value_numeric=r.value_numeric,
            value_numeric_2=r.value_numeric_2,
            value_unit=r.value_unit,
        )
        for r in rows
    ]
    return VitalsTrendResponse(observation_type=observation_type, data=data)


@router.get("/pathology-trend", response_model=List[PathologyTrendPoint])
async def pathology_trend(
    analyte: str = Query(...),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    q = (
        select(PathologyReport)
        .where(
            PathologyReport.user_id == current_user.id,
            PathologyReport.deleted_at.is_(None),
            PathologyReport.results.is_not(None),
        )
        .order_by(PathologyReport.report_date.asc())
        .limit(limit)
    )
    reports = (await db.execute(q)).scalars().all()
    points: List[PathologyTrendPoint] = []
    for report in reports:
        if not report.results:
            continue
        for result in report.results:
            if not isinstance(result, dict):
                continue
            r_analyte = result.get("analyte") or ""
            if analyte.lower() not in r_analyte.lower():
                continue
            points.append(PathologyTrendPoint(
                report_date=report.report_date,
                analyte=r_analyte,
                value=result.get("value"),
                unit=result.get("unit"),
                ref_range_low=result.get("ref_range_low"),
                ref_range_high=result.get("ref_range_high"),
                flag=result.get("flag"),
            ))
    return points


@router.get("/timeline", response_model=List[TimelineEvent])
async def timeline(
    limit: int = Query(50, ge=1, le=200),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    uid = current_user.id
    events: List[TimelineEvent] = []

    # Problems
    problems = (await db.execute(
        select(ProblemDiagnosis)
        .where(ProblemDiagnosis.user_id == uid, ProblemDiagnosis.deleted_at.is_(None))
        .order_by(ProblemDiagnosis.created_at.desc())
        .limit(limit)
    )).scalars().all()
    for p in problems:
        events.append(TimelineEvent(
            event_type="problem",
            event_date=p.onset_date or p.created_at,
            title=p.problem_name,
            description=p.clinical_notes,
            id=str(p.id),
        ))

    # Encounters
    encounters = (await db.execute(
        select(ClinicalEncounter)
        .where(ClinicalEncounter.user_id == uid, ClinicalEncounter.deleted_at.is_(None))
        .order_by(ClinicalEncounter.encounter_date.desc())
        .limit(limit)
    )).scalars().all()
    for e in encounters:
        events.append(TimelineEvent(
            event_type="encounter",
            event_date=e.encounter_date,
            title=f"Encounter — {e.provider_name or 'Unknown provider'}",
            description=e.chief_complaint,
            id=str(e.id),
        ))

    # Immunisations
    imms = (await db.execute(
        select(Immunisation)
        .where(Immunisation.user_id == uid, Immunisation.deleted_at.is_(None))
        .order_by(Immunisation.administration_date.desc())
        .limit(limit)
    )).scalars().all()
    for i in imms:
        events.append(TimelineEvent(
            event_type="immunisation",
            event_date=i.administration_date,
            title=i.vaccine_name,
            description=i.disease_targeted,
            id=str(i.id),
        ))

    # Pathology
    reports = (await db.execute(
        select(PathologyReport)
        .where(PathologyReport.user_id == uid, PathologyReport.deleted_at.is_(None))
        .order_by(PathologyReport.report_date.desc())
        .limit(limit)
    )).scalars().all()
    for r in reports:
        events.append(TimelineEvent(
            event_type="pathology",
            event_date=r.report_date,
            title=r.report_name,
            description=r.lab_name,
            id=str(r.id),
        ))

    # Sort descending by event_date (handle None)
    def sort_key(ev: TimelineEvent):
        d = ev.event_date
        if d is None:
            return ""
        return str(d)

    events.sort(key=sort_key, reverse=True)
    return events[:limit]
