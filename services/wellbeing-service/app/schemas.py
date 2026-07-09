from datetime import date, datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

AttendanceStatus = Literal["PRESENT", "ABSENT", "LATE", "JUSTIFIED_ABSENCE"]
IncidentSeverity = Literal["LOW", "MEDIUM", "HIGH", "CRITICAL"]
IncidentType = Literal["ACADEMIC", "BEHAVIORAL", "HEALTH", "WELLBEING", "OTHER"]


class AttendanceBase(BaseModel):
    student_id: str = Field(min_length=1, max_length=36)
    school_id: str = Field(min_length=1, max_length=36)
    grade: str = Field(min_length=1, max_length=50)
    record_date: date
    status: AttendanceStatus
    recorded_by: str = Field(min_length=1, max_length=100)


class AttendanceCreate(AttendanceBase):
    pass


class AttendanceUpdate(BaseModel):
    student_id: str | None = Field(default=None, min_length=1, max_length=36)
    school_id: str | None = Field(default=None, min_length=1, max_length=36)
    grade: str | None = Field(default=None, min_length=1, max_length=50)
    record_date: date | None = None
    status: AttendanceStatus | None = None
    recorded_by: str | None = Field(default=None, min_length=1, max_length=100)


class AttendanceResponse(BaseModel):
    attendance_id: UUID
    student_id: str
    school_id: str
    grade: str
    record_date: date
    status: str
    recorded_by: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class IncidentBase(BaseModel):
    student_id: str = Field(min_length=1, max_length=36)
    school_id: str = Field(min_length=1, max_length=36)
    incident_type: IncidentType
    severity: IncidentSeverity
    description: str = Field(min_length=1)
    reported_by: str = Field(min_length=1, max_length=100)


class IncidentCreate(IncidentBase):
    pass


class IncidentUpdate(BaseModel):
    student_id: str | None = Field(default=None, min_length=1, max_length=36)
    school_id: str | None = Field(default=None, min_length=1, max_length=36)
    incident_type: IncidentType | None = None
    severity: IncidentSeverity | None = None
    description: str | None = Field(default=None, min_length=1)
    reported_by: str | None = Field(default=None, min_length=1, max_length=100)


class IncidentResponse(BaseModel):
    incident_id: UUID
    student_id: str
    school_id: str
    incident_type: str
    severity: str
    description: str
    reported_by: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
