from datetime import datetime
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models import Student
from app.schemas import StudentCreate, StudentUpdate


class DuplicateDocumentNumberError(Exception):
    pass


def _document_number_exists(document_number: str, db: Session, excluded_student_id: UUID | None = None) -> bool:
    query = select(Student).where(Student.document_number == document_number)
    if excluded_student_id is not None:
        query = query.where(Student.student_id != str(excluded_student_id))
    return db.scalars(query).first() is not None


def create_student(db: Session, payload: StudentCreate) -> Student:
    if _document_number_exists(payload.document_number, db):
        raise DuplicateDocumentNumberError

    student = Student(**payload.model_dump())
    db.add(student)

    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise DuplicateDocumentNumberError from exc

    db.refresh(student)
    return student


def get_students(db: Session) -> list[Student]:
    return list(db.scalars(select(Student).order_by(Student.created_at.desc())).all())


def get_student_by_id(db: Session, student_id: UUID) -> Student | None:
    return db.get(Student, str(student_id))


def update_student(db: Session, student: Student, payload: StudentUpdate) -> Student:
    update_data = payload.model_dump(exclude_unset=True)
    document_number = update_data.get("document_number")

    if document_number is not None and _document_number_exists(
        document_number,
        db,
        excluded_student_id=UUID(student.student_id),
    ):
        raise DuplicateDocumentNumberError

    for field, value in update_data.items():
        setattr(student, field, value)

    student.updated_at = datetime.utcnow()

    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise DuplicateDocumentNumberError from exc

    db.refresh(student)
    return student


def delete_student(db: Session, student: Student) -> None:
    db.delete(student)
    db.commit()
