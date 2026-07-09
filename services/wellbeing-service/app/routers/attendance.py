from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app import crud
from app.database import get_db
from app.models import Attendance
from app.schemas import AttendanceCreate, AttendanceResponse, AttendanceUpdate

router = APIRouter(tags=["attendance"])


def _get_attendance_or_404(attendance_id: UUID, db: Session) -> Attendance:
    attendance = crud.get_attendance_by_id(db, attendance_id)
    if attendance is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Attendance not found")
    return attendance


@router.post("/attendance", response_model=AttendanceResponse, status_code=status.HTTP_201_CREATED)
def create_attendance(payload: AttendanceCreate, db: Session = Depends(get_db)) -> Attendance:
    return crud.create_attendance(db, payload)


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
