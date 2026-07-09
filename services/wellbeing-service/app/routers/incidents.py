from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app import crud
from app.database import get_db
from app.models import Incident
from app.schemas import IncidentCreate, IncidentResponse, IncidentUpdate

router = APIRouter(tags=["incidents"])


def _get_incident_or_404(incident_id: UUID, db: Session) -> Incident:
    incident = crud.get_incident_by_id(db, incident_id)
    if incident is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Incident not found")
    return incident


@router.post("/incidents", response_model=IncidentResponse, status_code=status.HTTP_201_CREATED)
def create_incident(payload: IncidentCreate, db: Session = Depends(get_db)) -> Incident:
    return crud.create_incident(db, payload)


@router.get("/incidents", response_model=list[IncidentResponse])
def get_incidents(db: Session = Depends(get_db)) -> list[Incident]:
    return crud.get_incidents(db)


@router.get("/incidents/{incident_id}", response_model=IncidentResponse)
def get_incident_by_id(incident_id: UUID, db: Session = Depends(get_db)) -> Incident:
    return _get_incident_or_404(incident_id, db)


@router.put("/incidents/{incident_id}", response_model=IncidentResponse)
def update_incident(
    incident_id: UUID,
    payload: IncidentUpdate,
    db: Session = Depends(get_db),
) -> Incident:
    incident = _get_incident_or_404(incident_id, db)
    return crud.update_incident(db, incident, payload)


@router.delete("/incidents/{incident_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_incident(incident_id: UUID, db: Session = Depends(get_db)) -> Response:
    incident = _get_incident_or_404(incident_id, db)
    crud.delete_incident(db, incident)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
