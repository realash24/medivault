from pydantic import BaseModel
from typing import Optional, List, Any


class DashboardSummary(BaseModel):
    active_problems: int
    active_medications: int
    adverse_reactions: int
    recent_vitals_count: int
    pathology_reports_count: int
    immunisations_count: int
    upcoming_immunisations: int
    recent_encounters_count: int
    documents_count: int


class VitalsTrendPoint(BaseModel):
    datetime: Any
    value_numeric: Optional[float] = None
    value_numeric_2: Optional[float] = None
    value_unit: Optional[str] = None


class VitalsTrendResponse(BaseModel):
    observation_type: str
    data: List[VitalsTrendPoint]


class PathologyTrendPoint(BaseModel):
    report_date: Any
    analyte: str
    value: Optional[str] = None
    unit: Optional[str] = None
    ref_range_low: Optional[str] = None
    ref_range_high: Optional[str] = None
    flag: Optional[str] = None


class TimelineEvent(BaseModel):
    event_type: str
    event_date: Any
    title: str
    description: Optional[str] = None
    id: Any
