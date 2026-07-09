from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict


class AnalyticsEventResponse(BaseModel):
    analytics_event_id: str
    event_id: str
    event_type: str
    correlation_id: str | None
    routing_key: str
    occurred_at: datetime | None
    payload: dict[str, Any]
    processed_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ProcessedEventResponse(BaseModel):
    event_id: str
    event_type: str
    correlation_id: str | None
    routing_key: str
    status: str
    attempts: int
    processed_at: datetime | None
    failed_at: datetime | None
    last_error: str | None

    model_config = ConfigDict(from_attributes=True)
