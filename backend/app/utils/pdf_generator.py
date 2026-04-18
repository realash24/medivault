import io
from datetime import date, datetime
from typing import Any, Dict, List, Optional


def generate_summary_pdf(data: Dict[str, Any]) -> bytes:
    """
    Generate a PDF health summary using reportlab.
    Returns bytes of the PDF.
    """
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import mm
    from reportlab.lib import colors
    from reportlab.platypus import (
        SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable,
    )

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=20 * mm,
        leftMargin=20 * mm,
        topMargin=20 * mm,
        bottomMargin=20 * mm,
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle("title", parent=styles["Heading1"], spaceAfter=6)
    h2_style = ParagraphStyle("h2", parent=styles["Heading2"], spaceAfter=4, spaceBefore=10)
    normal = styles["Normal"]

    story = []

    # Header
    person = data.get("person", {})
    name = f"{person.get('given_names', '')} {person.get('family_name', '')}".strip() or "Unknown"
    story.append(Paragraph(f"MediVault Health Summary — {name}", title_style))
    story.append(Paragraph(f"Generated: {datetime.utcnow().strftime('%d %b %Y %H:%M UTC')}", normal))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.grey))
    story.append(Spacer(1, 6))

    def section(title: str, rows: List[List[str]]):
        if not rows:
            return
        story.append(Paragraph(title, h2_style))
        table_data = rows
        t = Table(table_data, hAlign="LEFT", repeatRows=1)
        t.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1e3a5f")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 9),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f0f4f8")]),
            ("GRID", (0, 0), (-1, -1), 0.25, colors.HexColor("#cccccc")),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("LEFTPADDING", (0, 0), (-1, -1), 4),
            ("RIGHTPADDING", (0, 0), (-1, -1), 4),
        ]))
        story.append(t)
        story.append(Spacer(1, 4))

    # Problems
    problems = data.get("problems", [])
    if problems:
        rows = [["Problem", "Status", "Severity", "Onset"]]
        for p in problems:
            rows.append([
                p.get("problem_name", ""),
                p.get("status", ""),
                p.get("severity", "") or "",
                str(p.get("onset_date", "") or ""),
            ])
        section("Problems / Diagnoses", rows)

    # Medications
    medications = data.get("medications", [])
    if medications:
        rows = [["Medication", "Dose", "Frequency", "Status", "Prescriber"]]
        for m in medications:
            rows.append([
                m.get("medication_name", ""),
                m.get("dose", "") or "",
                m.get("frequency", "") or "",
                m.get("status", "") or "",
                m.get("prescriber", "") or "",
            ])
        section("Medications", rows)

    # Reactions
    reactions = data.get("reactions", [])
    if reactions:
        rows = [["Substance", "Type", "Severity", "Criticality"]]
        for r in reactions:
            rows.append([
                r.get("substance", ""),
                r.get("reaction_type", "") or "",
                r.get("severity", "") or "",
                r.get("criticality", "") or "",
            ])
        section("Adverse Reactions / Allergies", rows)

    # Vitals (latest)
    vitals = data.get("vitals", [])
    if vitals:
        rows = [["Type", "Value", "Unit", "Date/Time"]]
        for v in vitals:
            val = str(v.get("value_numeric", "") or "")
            if v.get("value_numeric_2"):
                val += f"/{v['value_numeric_2']}"
            rows.append([
                v.get("observation_type", ""),
                val,
                v.get("value_unit", "") or "",
                str(v.get("observation_datetime", "") or ""),
            ])
        section("Recent Vital Signs", rows)

    # Immunisations
    immunisations = data.get("immunisations", [])
    if immunisations:
        rows = [["Vaccine", "Date", "Dose #", "Next Due"]]
        for i in immunisations:
            rows.append([
                i.get("vaccine_name", ""),
                str(i.get("administration_date", "") or ""),
                str(i.get("dose_number", "") or ""),
                str(i.get("next_due_date", "") or ""),
            ])
        section("Immunisations", rows)

    # Encounters
    encounters = data.get("encounters", [])
    if encounters:
        rows = [["Date", "Type", "Provider", "Facility", "Chief Complaint"]]
        for e in encounters:
            rows.append([
                str(e.get("encounter_date", "") or ""),
                e.get("encounter_type", "") or "",
                e.get("provider_name", "") or "",
                e.get("facility", "") or "",
                (e.get("chief_complaint", "") or "")[:60],
            ])
        section("Clinical Encounters", rows)

    doc.build(story)
    return buffer.getvalue()
