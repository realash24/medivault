#!/usr/bin/env python3
"""
Seed script: Creates a demo user with 2 years of realistic health data.
Run: python seed_data.py
"""
import asyncio
import uuid
from datetime import date, datetime, timedelta
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.config import settings
from app.core.security import get_password_hash
from app.models.user import User
from app.models.person import Person
from app.models.problem import ProblemDiagnosis
from app.models.medication import MedicationOrder
from app.models.reaction import AdverseReaction
from app.models.vital_sign import VitalSign
from app.models.pathology_report import PathologyReport
from app.models.immunisation import Immunisation
from app.models.encounter import ClinicalEncounter

# Create engine
engine = create_async_engine(settings.DATABASE_URL)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def seed():
    async with AsyncSessionLocal() as db:
        # Create demo user
        user_id = uuid.uuid4()
        user = User(
            id=user_id,
            email="demo@medivault.health",
            hashed_password=get_password_hash("Demo123!"),
            is_active=True,
        )
        db.add(user)

        # Person profile
        person = Person(
            id=uuid.uuid4(),
            user_id=user_id,
            composition_uid=uuid.uuid4(),
            family_name="Demo",
            given_names="Alex",
            dob=date(1985, 6, 15),
            sex="male",
            blood_type="O+",
            city="Sydney",
            state="NSW",
            country="Australia",
            phone="+61400000000",
            emergency_contact_name="Jane Demo",
            emergency_contact_phone="+61400000001",
        )
        db.add(person)

        today = date.today()
        two_years_ago = today - timedelta(days=730)

        # Problems
        problems = [
            ProblemDiagnosis(
                id=uuid.uuid4(), user_id=user_id, composition_uid=uuid.uuid4(),
                problem_name="Type 2 Diabetes Mellitus",
                icd10="E11", snomed_ct="44054006",
                severity="moderate", status="active",
                onset_date=two_years_ago + timedelta(days=30),
                clinical_notes="HbA1c controlled on metformin. Quarterly review.",
            ),
            ProblemDiagnosis(
                id=uuid.uuid4(), user_id=user_id, composition_uid=uuid.uuid4(),
                problem_name="Essential Hypertension",
                icd10="I10", snomed_ct="59621000",
                severity="mild", status="active",
                onset_date=two_years_ago + timedelta(days=90),
                clinical_notes="BP target <130/80. On perindopril.",
            ),
            ProblemDiagnosis(
                id=uuid.uuid4(), user_id=user_id, composition_uid=uuid.uuid4(),
                problem_name="Hypercholesterolaemia",
                icd10="E78.0", snomed_ct="13644009",
                severity="mild", status="active",
                onset_date=two_years_ago + timedelta(days=120),
                clinical_notes="On rosuvastatin 10mg. LDL target <1.8.",
            ),
            ProblemDiagnosis(
                id=uuid.uuid4(), user_id=user_id, composition_uid=uuid.uuid4(),
                problem_name="Seasonal Allergic Rhinitis",
                icd10="J30.1", snomed_ct="21719001",
                severity="mild", status="active",
                onset_date=date(2015, 1, 1),
                clinical_notes="Spring/summer symptoms. Nasal corticosteroid PRN.",
            ),
        ]
        for p in problems:
            db.add(p)

        # Medications
        medications = [
            MedicationOrder(
                id=uuid.uuid4(), user_id=user_id, composition_uid=uuid.uuid4(),
                medication_name="Metformin", generic_name="Metformin hydrochloride",
                route="oral", dose="1000mg", frequency="twice daily",
                start_date=two_years_ago + timedelta(days=35),
                status="active", prescriber="Dr. Smith",
                indication="Type 2 Diabetes Mellitus",
            ),
            MedicationOrder(
                id=uuid.uuid4(), user_id=user_id, composition_uid=uuid.uuid4(),
                medication_name="Perindopril", generic_name="Perindopril erbumine",
                route="oral", dose="5mg", frequency="once daily",
                start_date=two_years_ago + timedelta(days=95),
                status="active", prescriber="Dr. Smith",
                indication="Essential Hypertension",
            ),
            MedicationOrder(
                id=uuid.uuid4(), user_id=user_id, composition_uid=uuid.uuid4(),
                medication_name="Rosuvastatin", generic_name="Rosuvastatin calcium",
                route="oral", dose="10mg", frequency="once daily (evening)",
                start_date=two_years_ago + timedelta(days=125),
                status="active", prescriber="Dr. Smith",
                indication="Hypercholesterolaemia",
            ),
            MedicationOrder(
                id=uuid.uuid4(), user_id=user_id, composition_uid=uuid.uuid4(),
                medication_name="Mometasone nasal spray",
                route="intranasal", dose="100mcg", frequency="once daily PRN",
                start_date=date(2020, 9, 1),
                status="active", prescriber="Dr. Jones",
                indication="Seasonal Allergic Rhinitis",
            ),
            MedicationOrder(
                id=uuid.uuid4(), user_id=user_id, composition_uid=uuid.uuid4(),
                medication_name="Amoxicillin",
                route="oral", dose="500mg", frequency="three times daily",
                start_date=two_years_ago + timedelta(days=200),
                end_date=two_years_ago + timedelta(days=207),
                status="completed", prescriber="Dr. Smith",
                indication="Sinusitis",
            ),
        ]
        for m in medications:
            db.add(m)

        # Adverse Reactions
        reactions = [
            AdverseReaction(
                id=uuid.uuid4(), user_id=user_id, composition_uid=uuid.uuid4(),
                substance="Penicillin",
                substance_type="medication",
                reaction_type="allergy",
                manifestation="Urticaria, angioedema",
                severity="moderate",
                criticality="high",
                verification_status="confirmed",
                onset_date=date(2005, 3, 10),
            ),
            AdverseReaction(
                id=uuid.uuid4(), user_id=user_id, composition_uid=uuid.uuid4(),
                substance="Shellfish",
                substance_type="food",
                reaction_type="allergy",
                manifestation="Nausea, vomiting",
                severity="mild",
                criticality="low",
                verification_status="confirmed",
                onset_date=date(2010, 7, 20),
            ),
            AdverseReaction(
                id=uuid.uuid4(), user_id=user_id, composition_uid=uuid.uuid4(),
                substance="NSAIDs",
                substance_type="medication",
                reaction_type="intolerance",
                manifestation="Gastric irritation",
                severity="mild",
                criticality="low",
                verification_status="confirmed",
                onset_date=date(2018, 1, 1),
            ),
        ]
        for r in reactions:
            db.add(r)

        # Vital Signs (weekly over 2 years)
        import random
        random.seed(42)
        vitals_data = []
        for i in range(0, 730, 7):  # Weekly vitals for 2 years
            obs_date = two_years_ago + timedelta(days=i)
            # Blood pressure
            vitals_data.append(VitalSign(
                id=uuid.uuid4(), user_id=user_id, composition_uid=uuid.uuid4(),
                observation_type="blood_pressure",
                value_numeric=random.uniform(120, 145),  # systolic
                value_numeric_2=random.uniform(75, 95),   # diastolic
                value_unit="mmHg",
                observation_datetime=datetime.combine(obs_date, datetime.min.time()),
            ))
            if i % 14 == 0:  # Fortnightly weight
                vitals_data.append(VitalSign(
                    id=uuid.uuid4(), user_id=user_id, composition_uid=uuid.uuid4(),
                    observation_type="weight",
                    value_numeric=random.uniform(82, 90),
                    value_unit="kg",
                    observation_datetime=datetime.combine(obs_date, datetime.min.time()),
                ))
            if i % 30 == 0:  # Monthly blood glucose
                vitals_data.append(VitalSign(
                    id=uuid.uuid4(), user_id=user_id, composition_uid=uuid.uuid4(),
                    observation_type="blood_glucose",
                    value_numeric=random.uniform(5.5, 9.0),
                    value_unit="mmol/L",
                    observation_datetime=datetime.combine(obs_date, datetime.min.time()),
                ))

        for v in vitals_data:
            db.add(v)

        # Pathology Reports (quarterly)
        pathology_reports = []
        for i in range(0, 730, 90):  # Quarterly
            report_date = two_years_ago + timedelta(days=i)
            hba1c = round(random.uniform(6.8, 8.2), 1)
            glucose = round(random.uniform(5.5, 9.0), 1)
            ldl = round(random.uniform(1.6, 3.2), 1)
            hdl = round(random.uniform(1.0, 1.8), 1)
            pathology_reports.append(PathologyReport(
                id=uuid.uuid4(), user_id=user_id, composition_uid=uuid.uuid4(),
                report_name=f"Metabolic Panel {report_date.strftime('%b %Y')}",
                lab_name="PathWest Laboratories",
                panel_type="metabolic",
                report_date=report_date,
                ordering_provider="Dr. Smith",
                results=[
                    {"analyte": "HbA1c", "value": hba1c, "unit": "%", "ref_range_low": 4.0, "ref_range_high": 6.0, "flag": "H" if hba1c > 6.0 else "N"},
                    {"analyte": "Fasting Glucose", "value": glucose, "unit": "mmol/L", "ref_range_low": 3.9, "ref_range_high": 6.1, "flag": "H" if glucose > 6.1 else "N"},
                    {"analyte": "LDL Cholesterol", "value": ldl, "unit": "mmol/L", "ref_range_low": 0.0, "ref_range_high": 2.0, "flag": "H" if ldl > 2.0 else "N"},
                    {"analyte": "HDL Cholesterol", "value": hdl, "unit": "mmol/L", "ref_range_low": 1.0, "ref_range_high": 3.0, "flag": "L" if hdl < 1.0 else "N"},
                    {"analyte": "Total Cholesterol", "value": round(ldl + hdl + 0.8, 1), "unit": "mmol/L", "ref_range_low": 0.0, "ref_range_high": 5.2, "flag": "N"},
                    {"analyte": "Triglycerides", "value": round(random.uniform(0.8, 2.5), 1), "unit": "mmol/L", "ref_range_low": 0.0, "ref_range_high": 1.7, "flag": "N"},
                    {"analyte": "eGFR", "value": round(random.uniform(72, 95), 0), "unit": "mL/min/1.73m²", "ref_range_low": 60.0, "ref_range_high": 120.0, "flag": "N"},
                    {"analyte": "Creatinine", "value": round(random.uniform(72, 98), 0), "unit": "μmol/L", "ref_range_low": 64.0, "ref_range_high": 110.0, "flag": "N"},
                ],
            ))

        for pr in pathology_reports:
            db.add(pr)

        # Immunisations
        immunisations = [
            Immunisation(
                id=uuid.uuid4(), user_id=user_id, composition_uid=uuid.uuid4(),
                vaccine_name="COVID-19 mRNA Vaccine (Moderna)",
                disease_targeted="COVID-19",
                administration_date=date(2021, 5, 15),
                batch_number="MOD-2021-001",
                dose_number=1,
            ),
            Immunisation(
                id=uuid.uuid4(), user_id=user_id, composition_uid=uuid.uuid4(),
                vaccine_name="COVID-19 mRNA Vaccine (Moderna)",
                disease_targeted="COVID-19",
                administration_date=date(2021, 6, 12),
                batch_number="MOD-2021-045",
                dose_number=2,
            ),
            Immunisation(
                id=uuid.uuid4(), user_id=user_id, composition_uid=uuid.uuid4(),
                vaccine_name="COVID-19 Booster (Pfizer/BioNTech)",
                disease_targeted="COVID-19",
                administration_date=date(2022, 1, 10),
                batch_number="PFZ-2022-001",
                dose_number=3,
            ),
            Immunisation(
                id=uuid.uuid4(), user_id=user_id, composition_uid=uuid.uuid4(),
                vaccine_name="Influenza Vaccine",
                disease_targeted="Influenza",
                administration_date=today - timedelta(days=400),
                batch_number="FLU-PREV",
                dose_number=1,
                next_due_date=today - timedelta(days=35),  # Overdue
            ),
            Immunisation(
                id=uuid.uuid4(), user_id=user_id, composition_uid=uuid.uuid4(),
                vaccine_name="Pneumococcal (PNEUMOVAX 23)",
                disease_targeted="Pneumococcal disease",
                administration_date=date(2020, 3, 1),
                batch_number="PNV-2020",
                dose_number=1,
                next_due_date=date(2025, 3, 1),
            ),
        ]
        for imm in immunisations:
            db.add(imm)

        # Clinical Encounters (every 3 months for 2 years)
        encounters = []
        for i in range(0, 730, 90):
            enc_date = two_years_ago + timedelta(days=i + 30)
            encounters.append(ClinicalEncounter(
                id=uuid.uuid4(), user_id=user_id, composition_uid=uuid.uuid4(),
                encounter_type="outpatient",
                encounter_date=enc_date,
                provider_name="Dr. Sarah Smith",
                provider_specialty="General Practice",
                facility="City Medical Centre",
                chief_complaint="Diabetes and hypertension review",
                assessment="Type 2 DM - HbA1c slightly elevated. BP well controlled.",
                plan="Continue current medications. Repeat HbA1c in 3 months. Dietary review recommended.",
            ))

        for enc in encounters:
            db.add(enc)

        await db.commit()
        print("✅ Demo data seeded successfully!")
        print(f"   User: demo@medivault.health / Demo123!")

if __name__ == "__main__":
    asyncio.run(seed())
