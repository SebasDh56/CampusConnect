from fastapi import Depends, FastAPI
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.config import settings
from app.consumer import AnalyticsConsumer
from app.database import get_db, init_db
from app.health import router as health_router
from app.models import AnalyticsEvent, ProcessedEvent
from app.schemas import AnalyticsEventResponse, ProcessedEventResponse

init_db()

consumer = AnalyticsConsumer()

app = FastAPI(title=settings.service_name)
app.include_router(health_router)


@app.on_event("startup")
def start_consumer() -> None:
    consumer.start()


@app.on_event("shutdown")
def stop_consumer() -> None:
    consumer.stop()


@app.get("/analytics-events", response_model=list[AnalyticsEventResponse])
def get_analytics_events(db: Session = Depends(get_db)) -> list[AnalyticsEvent]:
    return list(db.scalars(select(AnalyticsEvent).order_by(AnalyticsEvent.processed_at.desc())).all())


@app.get("/processed-events", response_model=list[ProcessedEventResponse])
def get_processed_events(db: Session = Depends(get_db)) -> list[ProcessedEvent]:
    return list(db.scalars(select(ProcessedEvent).order_by(ProcessedEvent.processed_at.desc().nullslast())).all())
