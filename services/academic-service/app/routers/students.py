from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy.orm import Session

from app import crud
from app.database import get_db
from app.event_factory import build_student_enrolled_event
from app.event_publisher import publish_event
from app.models import Student
from app.schemas import StudentCreate, StudentResponse, StudentUpdate

router = APIRouter(tags=["students"])


def _get_student_or_404(student_id: UUID, db: Session) -> Student:
    student = crud.get_student_by_id(db, student_id)
    if student is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")
    return student


@router.post("/students", response_model=StudentResponse, status_code=status.HTTP_201_CREATED)
def create_student(request: Request, payload: StudentCreate, db: Session = Depends(get_db)) -> Student:
    try:
        student = crud.create_student(db, payload)
    except crud.DuplicateDocumentNumberError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="document_number already exists") from exc

    correlation_id = request.headers.get("X-Correlation-Id") or str(uuid4())
    event = build_student_enrolled_event(student, correlation_id)
    publish_event(event, "student.enrolled")

    return student

@router.get("/students", response_model=list[StudentResponse])
def get_students(db: Session = Depends(get_db)) -> list[Student]:
    return crud.get_students(db)


@router.get("/students/{student_id}", response_model=StudentResponse)
def get_student(student_id: UUID, db: Session = Depends(get_db)) -> Student:
    return _get_student_or_404(student_id, db)


@router.put("/students/{student_id}", response_model=StudentResponse)
def update_student(student_id: UUID, payload: StudentUpdate, db: Session = Depends(get_db)) -> Student:
    student = _get_student_or_404(student_id, db)
    try:
        return crud.update_student(db, student, payload)
    except crud.DuplicateDocumentNumberError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="document_number already exists") from exc


@router.delete("/students/{student_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_student(student_id: UUID, db: Session = Depends(get_db)) -> Response:
    student = _get_student_or_404(student_id, db)
    crud.delete_student(db, student)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
