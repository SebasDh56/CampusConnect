from datetime import datetime

from pydantic import BaseModel, ConfigDict


class NotificationResponse(BaseModel):
    notification_id: str
    event_id: str
    event_type: str
    correlation_id: str | None
    recipient_type: str
    recipient_reference: str | None
    title: str
    message: str
    status: str
    created_at: datetime

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
