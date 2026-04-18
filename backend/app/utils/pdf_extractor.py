import logging
import io
from typing import Any, Dict, Optional

logger = logging.getLogger(__name__)


def extract_pathology_pdf(file_obj: io.BytesIO) -> Dict[str, Any]:
    """
    Extract structured data from a pathology PDF using pdfplumber.
    Returns a dict with report_name, lab_name, report_date, and results list.
    """
    try:
        import pdfplumber
        from datetime import date
        import re

        extracted: Dict[str, Any] = {
            "report_name": "Pathology Report",
            "lab_name": None,
            "report_date": None,
            "results": [],
        }

        with pdfplumber.open(file_obj) as pdf:
            full_text = ""
            all_tables = []
            for page in pdf.pages:
                text = page.extract_text() or ""
                full_text += text + "\n"
                tables = page.extract_tables()
                if tables:
                    all_tables.extend(tables)

            # Attempt to extract lab name from first lines
            lines = [ln.strip() for ln in full_text.splitlines() if ln.strip()]
            if lines:
                extracted["report_name"] = lines[0]
            if len(lines) > 1:
                extracted["lab_name"] = lines[1]

            # Try to find a date pattern
            date_pattern = re.compile(
                r"\b(\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{4}-\d{2}-\d{2})\b"
            )
            date_match = date_pattern.search(full_text)
            if date_match:
                raw_date = date_match.group(0)
                for fmt in ("%d/%m/%Y", "%m/%d/%Y", "%Y-%m-%d", "%d-%m-%Y"):
                    try:
                        from datetime import datetime as dt
                        extracted["report_date"] = dt.strptime(raw_date, fmt).date()
                        break
                    except ValueError:
                        continue

            # Parse tables into results
            results = []
            for table in all_tables:
                if not table:
                    continue
                headers = [str(h).lower().strip() if h else "" for h in table[0]]
                for row in table[1:]:
                    if not row or all(cell is None or str(cell).strip() == "" for cell in row):
                        continue
                    result_entry: Dict[str, Optional[str]] = {
                        "analyte": None,
                        "value": None,
                        "unit": None,
                        "ref_range_low": None,
                        "ref_range_high": None,
                        "flag": None,
                    }
                    for i, cell in enumerate(row):
                        if i >= len(headers):
                            break
                        val = str(cell).strip() if cell is not None else None
                        h = headers[i]
                        if any(k in h for k in ("test", "analyte", "component", "name")):
                            result_entry["analyte"] = val
                        elif any(k in h for k in ("result", "value")):
                            result_entry["value"] = val
                        elif "unit" in h:
                            result_entry["unit"] = val
                        elif any(k in h for k in ("ref", "range", "normal")):
                            if result_entry["ref_range_low"] is None:
                                result_entry["ref_range_low"] = val
                            else:
                                result_entry["ref_range_high"] = val
                        elif "flag" in h:
                            result_entry["flag"] = val
                    if result_entry["analyte"] or result_entry["value"]:
                        results.append(result_entry)

            extracted["results"] = results

    except Exception as exc:
        logger.warning("PDF extraction failed: %s", exc)
        extracted = {
            "report_name": "Pathology Report",
            "lab_name": None,
            "report_date": None,
            "results": [],
        }

    return extracted
