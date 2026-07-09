from datetime import datetime
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Attendance, Incident
from app.schemas import AttendanceCreate, AttendanceUpdate, IncidentCreate, IncidentUpdate


def create_attendance(db: Session, payload: AttendanceCreate) -> Attendance:
    attendance = Attendance(**payload.model_dump())
    db.add(attendance)
    db.commit()
    db.refresh(attendance)
    return attendance


def get_attendance(db: Session) -> list[Attendance]:
    return list(db.scalars(select(Attendance).order_by(Attendance.created_at.desc())).all())


def get_attendance_by_id(db: Session, attendance_id: UUID) -> Attendance | None:
    return db.get(Attendance, str(attendance_id))


def update_attendance(db: Session, attendance: Attendance, payload: AttendanceUpdate) -> Attendance:
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(attendance, field, value)

    attendance.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(attendance)
    return attendance


def delete_attendance(db: Session, attendance: Attendance) -> None:
    db.delete(attendance)
    db.commit()


def create_incident(db: Session, payload: IncidentCreate) -> Incident:
    incident = Incident(**payload.model_dump())
    db.add(incident)
    db.commit()
    db.refresh(incident)
    return incident


def get_incidents(db: Session) -> list[Incident]:
    return list(db.scalars(select(Incident).order_by(Incident.created_at.desc())).all())


def get_incident_by_id(db: Session, incident_id: UUID) -> Incident | None:
    return db.get(Incident, str(incident_id))


def update_incident(db: Session, incident: Incident, payload: IncidentUpdate) -> Incident:
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(incident, field, value)

    incident.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(incident)
    return incident


def delete_incident(db: Session, incident: Incident) -> None:
    db.delete(incident)
    db.commit()
