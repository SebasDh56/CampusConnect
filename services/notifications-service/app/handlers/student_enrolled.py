from app.models import Notification


def handle_student_enrolled(event: dict) -> Notification:
    data = event["data"]
    student_name = f"{data.get('firstName', '')} {data.get('lastName', '')}".strip()

    return Notification(
        event_id=event["eventId"],
        event_type=event["eventType"],
        correlation_id=event.get("correlationId"),
        recipient_type="SCHOOL",
        recipient_reference=data.get("schoolId"),
        title="Student enrolled",
        message=f"Student {student_name or data.get('studentId')} was enrolled in grade {data.get('grade')}.",
        status="CREATED",
    )
