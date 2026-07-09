from app.models import Notification


def handle_incident_reported(event: dict) -> Notification:
    data = event["data"]

    return Notification(
        event_id=event["eventId"],
        event_type=event["eventType"],
        correlation_id=event.get("correlationId"),
        recipient_type="SCHOOL",
        recipient_reference=data.get("schoolId"),
        title="Incident reported",
        message=(
            f"{data.get('severity')} {data.get('incidentType')} incident reported "
            f"for student {data.get('studentId')}."
        ),
        status="CREATED",
    )
