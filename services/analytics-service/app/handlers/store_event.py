from datetime import datetime

from app.models import AnalyticsEvent


def _parse_datetime(value: str | None) -> datetime | None:
    if not value:
        return None

    try:
        return datetime.fromisoformat(value.replace("Z", "+00:00")).replace(tzinfo=None)
    except ValueError:
        return None


def build_analytics_event(event: dict, routing_key: str) -> AnalyticsEvent:
    return AnalyticsEvent(
        event_id=event["eventId"],
        event_type=event["eventType"],
        correlation_id=event.get("correlationId"),
        routing_key=routing_key,
        occurred_at=_parse_datetime(event.get("occurredAt")),
        payload=event,
    )
