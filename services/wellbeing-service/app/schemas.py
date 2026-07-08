from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field


class AttendanceCreate(BaseModel):
    student_id: str = Field(min_length=1)
    school_id: str | None = None
    grade: str | None = None
    record_date: date
    status: str = Field(min_length=1)
    recorded_by: str | None = None


class AttendanceRead(BaseModel):
    attendance_id: str
    student_id: str
    school_id: str | None
    grade: str | None
    record_date: date
    status: str
    recorded_by: str | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class IncidentCreate(BaseModel):
    student_id: str = Field(min_length=1)
    school_id: str | None = None
    incident_type: str = Field(min_length=1)
    severity: str | None = None
    description: str | None = None
    reported_by: str | None = None


class IncidentRead(BaseModel):
    incident_id: str
    student_id: str
    school_id: str | None
    incident_type: str
    severity: str | None
    description: str | None
    reported_by: str | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
