from __future__ import annotations

import argparse
import json
from copy import deepcopy
from datetime import date
from pathlib import Path
from typing import Any

from scripts.smoke_test import request_json, wait_for


def load_demo_config(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def find_existing(items: list[dict[str, Any]], key: str, value: Any) -> dict[str, Any] | None:
    return next((item for item in items if item.get(key) == value), None)


def build_seed_payloads(
    config: dict[str, Any], student_id: str, record_date: date
) -> dict[str, dict[str, Any]]:
    student = config["student"]
    actors = config["actors"]
    payment = deepcopy(config["payment"])
    payment.update({"student_id": student_id, "school_id": student["school_id"]})

    attendance = {
        "student_id": student_id,
        "school_id": student["school_id"],
        "grade": student["grade"],
        "record_date": record_date.isoformat(),
        "status": config["attendance"]["status"],
        "recorded_by": actors[config["attendance"]["recorded_by_actor"]]["username"],
    }
    incident = {
        "student_id": student_id,
        "school_id": student["school_id"],
        "incident_type": config["incident"]["incident_type"],
        "severity": config["incident"]["severity"],
        "description": config["incident"]["description"],
        "reported_by": actors[config["incident"]["reported_by_actor"]]["username"],
    }
    return {"payment": payment, "attendance": attendance, "incident": incident}


def run(args: argparse.Namespace) -> dict[str, Any]:
    gateway = args.gateway.rstrip("/")
    config = load_demo_config(args.config)
    headers = {"apikey": args.api_key, "X-Correlation-Id": "seed-campusconnect-demo"}

    students = request_json(f"{gateway}/academic/students", headers=headers)
    student = find_existing(students, "document_number", config["student"]["document_number"])
    created = {"student": False, "payment": False, "attendance": False, "incident": False}
    if student is None:
        student = request_json(
            f"{gateway}/academic/students",
            method="POST",
            headers=headers,
            payload=config["student"],
        )
        created["student"] = True

    student_id = student["student_id"]
    payloads = build_seed_payloads(config, student_id, date.today())

    payments = request_json(f"{gateway}/payments/payments", headers=headers)
    payment = find_existing(payments, "invoice_id", payloads["payment"]["invoice_id"])
    if payment is None:
        payment = request_json(
            f"{gateway}/payments/payments",
            method="POST",
            headers=headers,
            payload=payloads["payment"],
        )
        created["payment"] = True
    if payment["payment_status"] not in {"PAID", "CONFIRMED"}:
        payment = request_json(
            f"{gateway}/payments/payments/{payment['payment_id']}",
            method="PUT",
            headers=headers,
            payload={"payment_status": "PAID"},
        )

    attendance_items = request_json(f"{gateway}/wellbeing/attendance", headers=headers)
    attendance = next(
        (
            item
            for item in attendance_items
            if item["student_id"] == student_id
            and item["recorded_by"] == payloads["attendance"]["recorded_by"]
        ),
        None,
    )
    if attendance is None:
        attendance = request_json(
            f"{gateway}/wellbeing/attendance",
            method="POST",
            headers=headers,
            payload=payloads["attendance"],
        )
        created["attendance"] = True

    incidents = request_json(f"{gateway}/wellbeing/incidents", headers=headers)
    incident = next(
        (
            item
            for item in incidents
            if item["student_id"] == student_id
            and item["description"] == payloads["incident"]["description"]
        ),
        None,
    )
    if incident is None:
        incident = request_json(
            f"{gateway}/wellbeing/incidents",
            method="POST",
            headers=headers,
            payload=payloads["incident"],
        )
        created["incident"] = True

    analytics = wait_for(
        lambda: request_json(f"{gateway}/analytics/analytics-events", headers=headers),
        lambda events: {
            event["event_type"]
            for event in events
            if isinstance(event.get("payload", {}).get("data"), dict)
            and event["payload"]["data"].get("studentId") == student_id
        }
        >= {"StudentEnrolled", "PaymentConfirmed", "AttendanceRecorded", "IncidentReported"},
        "the seeded events in Analytics",
    )

    return {
        "student_id": student_id,
        "payment_id": payment["payment_id"],
        "actors": {key: value["username"] for key, value in config["actors"].items()},
        "created": created,
        "analytics_events": len(
            [
                event
                for event in analytics
                if isinstance(event.get("payload", {}).get("data"), dict)
                and event["payload"]["data"].get("studentId") == student_id
            ]
        ),
    }


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Load reproducible CampusConnect demo data through the APIs.")
    parser.add_argument("--config", type=Path, default=Path("demo/demo-data.json"))
    parser.add_argument("--gateway", default="http://localhost:8000")
    parser.add_argument("--api-key", default="campusconnect-dev-api-key")
    return parser.parse_args()


if __name__ == "__main__":
    print(json.dumps(run(parse_args()), indent=2))
