from datetime import UTC, datetime
from uuid import uuid4

from app.models import Student


def build_student_enrolled_event(student: Student, correlation_id: str) -> dict:
    return {
        "eventId": str(uuid4()),
        "eventType": "StudentEnrolled",
        "occurredAt": datetime.now(UTC).isoformat(),
        "correlationId": correlation_id,
        "data": {
            "studentId": student.student_id,
            "schoolId": student.school_id,
            "firstName": student.first_name,
            "lastName": student.last_name,
            "documentNumber": student.document_number,
            "grade": student.grade,
            "academicYear": student.academic_year,
            "enrollmentStatus": student.enrollment_status,
        },
    }
