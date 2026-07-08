from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Attendance, Incident
from app.schemas import AttendanceCreate, AttendanceRead, IncidentCreate, IncidentRead

router = APIRouter()


@router.post("/attendance", response_model=AttendanceRead, status_code=status.HTTP_201_CREATED)
def create_attendance(payload: AttendanceCreate, db: Session = Depends(get_db)) -> Attendance:
    attendance = Attendance(**payload.model_dump())
    db.add(attendance)
    db.commit()
    db.refresh(attendance)
    return attendance


@router.get("/attendance", response_model=list[AttendanceRead])
def list_attendance(db: Session = Depends(get_db)) -> list[Attendance]:
    return list(db.scalars(select(Attendance).order_by(Attendance.created_at.desc())).all())


@router.get("/attendance/{attendance_id}", response_model=AttendanceRead)
def get_attendance(attendance_id: str, db: Session = Depends(get_db)) -> Attendance:
    attendance = db.get(Attendance, attendance_id)
    if attendance is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Attendance not found")
    return attendance


@router.post("/incidents", response_model=IncidentRead, status_code=status.HTTP_201_CREATED)
def create_incident(payload: IncidentCreate, db: Session = Depends(get_db)) -> Incident:
    incident = Incident(**payload.model_dump())
    db.add(incident)
    db.commit()
    db.refresh(incident)
    return incident


@router.get("/incidents", response_model=list[IncidentRead])
def list_incidents(db: Session = Depends(get_db)) -> list[Incident]:
    return list(db.scalars(select(Incident).order_by(Incident.created_at.desc())).all())


@router.get("/incidents/{incident_id}", response_model=IncidentRead)
def get_incident(incident_id: str, db: Session = Depends(get_db)) -> Incident:
    incident = db.get(Incident, incident_id)
    if incident is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Incident not found")
    return incident
