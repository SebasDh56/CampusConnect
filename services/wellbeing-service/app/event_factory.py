from datetime import UTC, datetime
from uuid import uuid4

from app.models import Attendance, Incident


def build_attendance_recorded_event(attendance: Attendance, correlation_id: str) -> dict:
    return {
        "eventId": str(uuid4()),
        "eventType": "AttendanceRecorded",
        "occurredAt": datetime.now(UTC).isoformat(),
        "correlationId": correlation_id,
        "data": {
            "attendanceId": attendance.attendance_id,
            "studentId": attendance.student_id,
            "schoolId": attendance.school_id,
            "grade": attendance.grade,
            "recordDate": attendance.record_date.isoformat(),
            "status": attendance.status,
            "recordedBy": attendance.recorded_by,
        },
    }


def build_incident_reported_event(incident: Incident, correlation_id: str) -> dict:
    return {
        "eventId": str(uuid4()),
        "eventType": "IncidentReported",
        "occurredAt": datetime.now(UTC).isoformat(),
        "correlationId": correlation_id,
        "data": {
            "incidentId": incident.incident_id,
            "studentId": incident.student_id,
            "schoolId": incident.school_id,
            "incidentType": incident.incident_type,
            "severity": incident.severity,
            "description": incident.description,
            "reportedBy": incident.reported_by,
        },
    }
