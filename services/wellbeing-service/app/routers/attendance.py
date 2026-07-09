from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy.orm import Session

from app import crud
from app.database import get_db
from app.event_factory import build_attendance_recorded_event
from app.event_publisher import publish_event
from app.models import Attendance
from app.schemas import AttendanceCreate, AttendanceResponse, AttendanceUpdate

router = APIRouter(tags=["attendance"])


def _get_attendance_or_404(attendance_id: UUID, db: Session) -> Attendance:
    attendance = crud.get_attendance_by_id(db, attendance_id)
    if attendance is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Attendance not found")
    return attendance


@router.post("/attendance", response_model=AttendanceResponse, status_code=status.HTTP_201_CREATED)
def create_attendance(request: Request, payload: AttendanceCreate, db: Session = Depends(get_db)) -> Attendance:
    attendance = crud.create_attendance(db, payload)
    correlation_id = request.headers.get("X-Correlation-Id") or str(uuid4())
    event = build_attendance_recorded_event(attendance, correlation_id)
    publish_event(event, "attendance.recorded")
    return attendance


@router.get("/attendance", response_model=list[AttendanceResponse])
def get_attendance(db: Session = Depends(get_db)) -> list[Attendance]:
    return crud.get_attendance(db)


@router.get("/attendance/{attendance_id}", response_model=AttendanceResponse)
def get_attendance_by_id(attendance_id: UUID, db: Session = Depends(get_db)) -> Attendance:
    return _get_attendance_or_404(attendance_id, db)


@router.put("/attendance/{attendance_id}", response_model=AttendanceResponse)
def update_attendance(
    attendance_id: UUID,
    payload: AttendanceUpdate,
    db: Session = Depends(get_db),
) -> Attendance:
    attendance = _get_attendance_or_404(attendance_id, db)
    return crud.update_attendance(db, attendance, payload)


@router.delete("/attendance/{attendance_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_attendance(attendance_id: UUID, db: Session = Depends(get_db)) -> Response:
    attendance = _get_attendance_or_404(attendance_id, db)
    crud.delete_attendance(db, attendance)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
