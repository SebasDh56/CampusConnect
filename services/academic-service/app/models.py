from datetime import datetime
from uuid import uuid4

from sqlalchemy import DateTime, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Student(Base):
    __tablename__ = "students"

    student_id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    school_id: Mapped[str | None] = mapped_column(String(36), nullable=True)
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    document_number: Mapped[str] = mapped_column(String(50), nullable=False, unique=True, index=True)
    grade: Mapped[str] = mapped_column(String(50), nullable=False)
    academic_year: Mapped[str] = mapped_column(String(20), nullable=False)
    enrollment_status: Mapped[str] = mapped_column(String(30), nullable=False, default="ENROLLED")
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )
