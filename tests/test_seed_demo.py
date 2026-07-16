import unittest
from datetime import date
from pathlib import Path

from scripts.seed_demo import build_seed_payloads, find_existing, load_demo_config


class DemoSeedTests(unittest.TestCase):
    def test_demo_config_defines_the_four_business_actors(self) -> None:
        config = load_demo_config(Path("demo/demo-data.json"))

        self.assertEqual(
            set(config["actors"]),
            {"secretary", "finance", "teacher", "wellbeing"},
        )
        self.assertTrue(all(actor["username"] for actor in config["actors"].values()))

    def test_seed_payloads_share_student_data_and_actor_identities(self) -> None:
        config = {
            "actors": {
                "teacher": {"username": "docente.demo"},
                "wellbeing": {"username": "bienestar.demo"},
            },
            "student": {
                "school_id": "SCH-DEMO",
                "first_name": "Ana",
                "last_name": "Demo",
                "document_number": "DOC-DEMO",
                "grade": "8vo EGB",
                "academic_year": "2026",
                "enrollment_status": "ENROLLED",
            },
            "payment": {
                "invoice_id": "INV-DEMO",
                "amount": 100,
                "currency": "USD",
                "payment_method": "TRANSFER",
                "payment_status": "PENDING",
            },
            "attendance": {"status": "PRESENT", "recorded_by_actor": "teacher"},
            "incident": {
                "incident_type": "WELLBEING",
                "severity": "MEDIUM",
                "description": "Seguimiento de demostracion",
                "reported_by_actor": "wellbeing",
            },
        }

        payloads = build_seed_payloads(config, "student-1", date(2026, 7, 16))

        self.assertEqual(payloads["payment"]["student_id"], "student-1")
        self.assertEqual(payloads["attendance"]["school_id"], "SCH-DEMO")
        self.assertEqual(payloads["attendance"]["grade"], "8vo EGB")
        self.assertEqual(payloads["attendance"]["recorded_by"], "docente.demo")
        self.assertEqual(payloads["incident"]["reported_by"], "bienestar.demo")
        self.assertEqual(payloads["attendance"]["record_date"], "2026-07-16")

    def test_find_existing_supports_idempotent_seed_lookups(self) -> None:
        items = [{"invoice_id": "INV-1"}, {"invoice_id": "INV-2"}]

        self.assertEqual(find_existing(items, "invoice_id", "INV-2"), items[1])
        self.assertIsNone(find_existing(items, "invoice_id", "INV-3"))


if __name__ == "__main__":
    unittest.main()
