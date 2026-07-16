from __future__ import annotations

import argparse
import base64
import json
import time
from datetime import date, datetime, timezone
from typing import Any, Callable
from urllib.error import HTTPError
from urllib.request import Request, urlopen


def build_demo_payloads(stamp: str, school_id: str) -> dict[str, dict[str, Any]]:
    return {
        "student": {
            "school_id": school_id,
            "first_name": "Demo",
            "last_name": "CampusConnect",
            "document_number": f"DOC-{stamp}",
            "grade": "8vo EGB",
            "academic_year": str(date.today().year),
            "enrollment_status": "ENROLLED",
        },
        "payment": {
            "school_id": school_id,
            "invoice_id": f"INV-{stamp}",
            "amount": 125.50,
            "currency": "USD",
            "payment_method": "TRANSFER",
            "payment_status": "PENDING",
        },
        "attendance": {
            "school_id": school_id,
            "grade": "8vo EGB",
            "record_date": date.today().isoformat(),
            "status": "PRESENT",
            "recorded_by": "Docente Demo",
        },
        "incident": {
            "school_id": school_id,
            "incident_type": "WELLBEING",
            "severity": "MEDIUM",
            "description": "Incidente controlado para verificar la integracion.",
            "reported_by": "Bienestar Demo",
        },
    }


def _event(event_id: str, event_type: str, correlation_id: str, data: Any) -> dict[str, Any]:
    return {
        "eventId": event_id,
        "eventType": event_type,
        "occurredAt": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "correlationId": correlation_id,
        "data": data,
    }


def build_invalid_event(event_id: str, correlation_id: str) -> dict[str, Any]:
    return _event(event_id, "PaymentConfirmed", correlation_id, "invalid-data-shape")


def build_duplicate_event(event_id: str, correlation_id: str) -> dict[str, Any]:
    return _event(
        event_id,
        "StudentEnrolled",
        correlation_id,
        {
            "studentId": "STU-IDEMPOTENCY",
            "schoolId": "SCH-001",
            "firstName": "Idempotent",
            "lastName": "Receiver",
            "grade": "8vo EGB",
            "academicYear": str(date.today().year),
            "enrollmentStatus": "ENROLLED",
        },
    )


def request_json(
    url: str,
    *,
    method: str = "GET",
    headers: dict[str, str] | None = None,
    payload: Any = None,
    expected: tuple[int, ...] = (200, 201),
) -> Any:
    request_headers = {"Accept": "application/json", **(headers or {})}
    body = None
    if payload is not None:
        request_headers["Content-Type"] = "application/json"
        body = json.dumps(payload).encode("utf-8")

    request = Request(url, data=body, headers=request_headers, method=method)
    try:
        with urlopen(request, timeout=10) as response:
            status = response.status
            raw = response.read().decode("utf-8")
    except HTTPError as error:
        status = error.code
        raw = error.read().decode("utf-8")

    if status not in expected:
        raise RuntimeError(f"{method} {url} returned {status}: {raw}")
    return json.loads(raw) if raw else None


def wait_for(
    fetch: Callable[[], Any],
    predicate: Callable[[Any], bool],
    description: str,
    timeout_seconds: float = 30,
) -> Any:
    deadline = time.monotonic() + timeout_seconds
    latest = None
    while time.monotonic() < deadline:
        latest = fetch()
        if predicate(latest):
            return latest
        time.sleep(0.5)
    raise RuntimeError(f"Timeout waiting for {description}. Last value: {latest!r}")


def rabbit_headers(user: str, password: str) -> dict[str, str]:
    token = base64.b64encode(f"{user}:{password}".encode("ascii")).decode("ascii")
    return {"Authorization": f"Basic {token}"}


def publish_event(
    rabbit_url: str,
    headers: dict[str, str],
    routing_key: str,
    event: dict[str, Any],
) -> None:
    result = request_json(
        f"{rabbit_url}/api/exchanges/campusconnect/campusconnect.events/publish",
        method="POST",
        headers=headers,
        payload={
            "properties": {"content_type": "application/json", "delivery_mode": 2},
            "routing_key": routing_key,
            "payload": json.dumps(event),
            "payload_encoding": "string",
        },
    )
    if not result.get("routed"):
        raise RuntimeError(f"RabbitMQ did not route {routing_key}")


def run(args: argparse.Namespace) -> dict[str, Any]:
    gateway = args.gateway.rstrip("/")
    rabbit = args.rabbit.rstrip("/")
    stamp = str(int(time.time() * 1000))
    correlation_id = f"corr-demo-{stamp}"
    api_headers = {"apikey": args.api_key, "X-Correlation-Id": correlation_id}
    rabbit_auth = rabbit_headers(args.rabbit_user, args.rabbit_password)

    request_json(f"{gateway}/academic/students", expected=(401,))

    for port in (3001, 3002, 3003, 3004, 3005):
        request_json(f"http://localhost:{port}/health")

    payloads = build_demo_payloads(stamp, args.school_id)
    student = request_json(
        f"{gateway}/academic/students",
        method="POST",
        headers=api_headers,
        payload=payloads["student"],
    )
    student_id = student["student_id"]
    for key in ("payment", "attendance", "incident"):
        payloads[key]["student_id"] = student_id

    payment = request_json(
        f"{gateway}/payments/payments",
        method="POST",
        headers=api_headers,
        payload=payloads["payment"],
    )
    payment = request_json(
        f"{gateway}/payments/payments/{payment['payment_id']}",
        method="PUT",
        headers=api_headers,
        payload={"payment_status": "PAID"},
    )
    request_json(
        f"{gateway}/wellbeing/attendance",
        method="POST",
        headers=api_headers,
        payload=payloads["attendance"],
    )
    request_json(
        f"{gateway}/wellbeing/incidents",
        method="POST",
        headers=api_headers,
        payload=payloads["incident"],
    )

    analytics = wait_for(
        lambda: request_json(f"{gateway}/analytics/processed-events", headers=api_headers),
        lambda events: {
            event["event_type"] for event in events if event["correlation_id"] == correlation_id
        }
        >= {"StudentEnrolled", "PaymentConfirmed", "AttendanceRecorded", "IncidentReported"},
        "the four analytics events",
    )
    notifications = wait_for(
        lambda: request_json(f"{gateway}/notifications/notifications", headers=api_headers),
        lambda items: len([item for item in items if item["correlation_id"] == correlation_id]) >= 3,
        "three notifications",
    )
    updated_student = wait_for(
        lambda: request_json(f"{gateway}/academic/students/{student_id}", headers=api_headers),
        lambda item: item["financial_status"] == "PAID",
        "academic financial status",
    )

    queue_url = f"{rabbit}/api/queues/campusconnect/campusconnect.dead-letter.queue"
    dlq_before = request_json(queue_url, headers=rabbit_auth)["messages"]
    invalid_id = f"evt-invalid-{stamp}"
    publish_event(rabbit, rabbit_auth, "payment.confirmed", build_invalid_event(invalid_id, correlation_id))
    failed_events = wait_for(
        lambda: request_json(f"{gateway}/notifications/processed-events", headers=api_headers),
        lambda events: any(
            event["event_id"] == invalid_id and event["status"] == "FAILED" for event in events
        ),
        "a FAILED notification event",
    )
    dlq_after = wait_for(
        lambda: request_json(queue_url, headers=rabbit_auth)["messages"],
        lambda count: count > dlq_before,
        "the invalid event in the DLQ",
    )

    duplicate_id = f"evt-duplicate-{stamp}"
    duplicate = build_duplicate_event(duplicate_id, f"corr-duplicate-{stamp}")
    publish_event(rabbit, rabbit_auth, "student.enrolled", duplicate)
    publish_event(rabbit, rabbit_auth, "student.enrolled", duplicate)

    def duplicate_processed_once(path: str) -> bool:
        events = request_json(f"{gateway}{path}", headers=api_headers)
        return len([event for event in events if event["event_id"] == duplicate_id]) == 1

    wait_for(lambda: duplicate_processed_once("/analytics/processed-events"), bool, "analytics idempotency")
    wait_for(lambda: duplicate_processed_once("/notifications/processed-events"), bool, "notification idempotency")

    return {
        "student_id": student_id,
        "payment_id": payment["payment_id"],
        "financial_status": updated_student["financial_status"],
        "analytics_events": len(
            [event for event in analytics if event["correlation_id"] == correlation_id]
        ),
        "notifications": len(
            [item for item in notifications if item["correlation_id"] == correlation_id]
        ),
        "failed_event_recorded": any(event["event_id"] == invalid_id for event in failed_events),
        "dlq_messages_added": dlq_after - dlq_before,
        "idempotent_event_id": duplicate_id,
    }


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run the CampusConnect 360 end-to-end smoke test.")
    parser.add_argument("--gateway", default="http://localhost:8000")
    parser.add_argument("--api-key", default="campusconnect-dev-api-key")
    parser.add_argument("--rabbit", default="http://localhost:15672")
    parser.add_argument("--rabbit-user", default="campus_user")
    parser.add_argument("--rabbit-password", default="campus_pass")
    parser.add_argument("--school-id", default="SCH-001")
    return parser.parse_args()


if __name__ == "__main__":
    print(json.dumps(run(parse_args()), indent=2))
