import sys
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from scripts.smoke_test import build_demo_payloads, build_duplicate_event, build_invalid_event


class DemoPayloadTests(unittest.TestCase):
    def test_demo_payloads_share_student_and_school_identifiers(self) -> None:
        payloads = build_demo_payloads("12345", "SCH-001")

        self.assertEqual(payloads["student"]["document_number"], "DOC-12345")
        self.assertEqual(payloads["payment"]["invoice_id"], "INV-12345")
        self.assertEqual(payloads["payment"]["school_id"], "SCH-001")
        self.assertEqual(payloads["attendance"]["school_id"], "SCH-001")
        self.assertEqual(payloads["incident"]["school_id"], "SCH-001")

    def test_invalid_event_has_an_id_but_an_unusable_data_shape(self) -> None:
        event = build_invalid_event("event-invalid", "corr-invalid")

        self.assertEqual(event["eventId"], "event-invalid")
        self.assertEqual(event["eventType"], "PaymentConfirmed")
        self.assertIsInstance(event["data"], str)

    def test_duplicate_event_is_a_valid_student_enrolled_message(self) -> None:
        event = build_duplicate_event("event-duplicate", "corr-duplicate")

        self.assertEqual(event["eventType"], "StudentEnrolled")
        self.assertEqual(event["data"]["studentId"], "STU-IDEMPOTENCY")
        self.assertIn("occurredAt", event)


if __name__ == "__main__":
    unittest.main()
