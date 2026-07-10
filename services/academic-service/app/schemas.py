from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class StudentCreate(BaseModel):
    school_id: str | None = None
    first_name: str = Field(min_length=1)
    last_name: str = Field(min_length=1)
    document_number: str = Field(min_length=1)
    grade: str = Field(min_length=1)
    academic_year: str = Field(min_length=1)
    enrollment_status: str = "ENROLLED"


class StudentUpdate(BaseModel):
    school_id: str | None = None
    first_name: str | None = Field(default=None, min_length=1)
    last_name: str | None = Field(default=None, min_length=1)
    document_number: str | None = Field(default=None, min_length=1)
    grade: str | None = Field(default=None, min_length=1)
    academic_year: str | None = Field(default=None, min_length=1)
    enrollment_status: str | None = Field(default=None, min_length=1)


class StudentResponse(BaseModel):
    student_id: UUID
    school_id: str | None
    first_name: str
    last_name: str
    document_number: str
    grade: str
    academic_year: str
    enrollment_status: str
    financial_status: str
    last_confirmed_payment_id: str | None
    financial_status_updated_at: datetime | None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
