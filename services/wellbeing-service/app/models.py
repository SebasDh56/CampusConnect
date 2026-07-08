from datetime import date, datetime
from uuid import uuid4

from sqlalchemy import Date, DateTime, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Attendance(Base):
    __tablename__ = "attendance"

    attendance_id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    student_id: Mapped[str] = mapped_column(String(36), nullable=False, index=True)
    school_id: Mapped[str | None] = mapped_column(String(36), nullable=True)
    grade: Mapped[str | None] = mapped_column(String(50), nullable=True)
    record_date: Mapped[date] = mapped_column(Date, nullable=False)
    status: Mapped[str] = mapped_column(String(30), nullable=False)
    recorded_by: Mapped[str | None] = mapped_column(String(100), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)


class Incident(Base):
    __tablename__ = "incidents"

    incident_id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    student_id: Mapped[str] = mapped_column(String(36), nullable=False, index=True)
    school_id: Mapped[str | None] = mapped_column(String(36), nullable=True)
    incident_type: Mapped[str] = mapped_column(String(50), nullable=False)
    severity: Mapped[str | None] = mapped_column(String(30), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    reported_by: Mapped[str | None] = mapped_column(String(100), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)
