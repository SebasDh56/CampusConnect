import json
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


class GatewayContractTests(unittest.TestCase):
    def setUp(self) -> None:
        self.config = (ROOT / "infrastructure" / "gateway" / "kong.yml").read_text(encoding="utf-8")

    def test_all_business_services_are_exposed_by_kong(self) -> None:
        expected = {
            "academic": "academic-route",
            "payments": "payments-route",
            "wellbeing": "wellbeing-route",
            "notifications": "notifications-route",
            "analytics": "analytics-route",
        }

        for prefix, route in expected.items():
            with self.subTest(prefix=prefix):
                self.assertIn(f"- name: {route}", self.config)
                self.assertIn(f"- /{prefix}", self.config)

        self.assertEqual(self.config.count("  - name: cors\n"), 5)
        self.assertEqual(self.config.count("  - name: key-auth\n"), 5)


class RabbitMqContractTests(unittest.TestCase):
    def setUp(self) -> None:
        path = ROOT / "infrastructure" / "rabbitmq" / "definitions.json"
        self.definitions = json.loads(path.read_text(encoding="utf-8"))

    def test_declares_only_queues_that_have_consumers(self) -> None:
        queues = {queue["name"]: queue for queue in self.definitions["queues"]}
        self.assertEqual(
            set(queues),
            {
                "notifications.events.queue",
                "analytics.events.queue",
                "academic.payment-confirmed.queue",
                "campusconnect.dead-letter.queue",
            },
        )

        for name in (
            "notifications.events.queue",
            "analytics.events.queue",
            "academic.payment-confirmed.queue",
        ):
            with self.subTest(queue=name):
                self.assertEqual(
                    queues[name]["arguments"],
                    {
                        "x-dead-letter-exchange": "campusconnect.dead-letter",
                        "x-dead-letter-routing-key": "dead-letter",
                    },
                )

    def test_bindings_model_publish_subscribe_and_point_to_point(self) -> None:
        bindings = {
            (binding["destination"], binding["routing_key"])
            for binding in self.definitions["bindings"]
        }
        expected = {
            ("notifications.events.queue", "student.enrolled"),
            ("notifications.events.queue", "payment.confirmed"),
            ("notifications.events.queue", "incident.reported"),
            ("analytics.events.queue", "student.enrolled"),
            ("analytics.events.queue", "payment.confirmed"),
            ("analytics.events.queue", "attendance.recorded"),
            ("analytics.events.queue", "incident.reported"),
            ("academic.payment-confirmed.queue", "payment.confirmed"),
            ("campusconnect.dead-letter.queue", "dead-letter"),
        }
        self.assertEqual(bindings, expected)


class DemoSeedContractTests(unittest.TestCase):
    def test_compose_loads_demo_data_through_the_gateway(self) -> None:
        compose = (ROOT / "docker-compose.yml").read_text(encoding="utf-8")

        self.assertIn("  demo-seed:\n", compose)
        self.assertIn("python -m scripts.seed_demo", compose)
        self.assertIn("--gateway http://kong:8000", compose)
        self.assertIn("./demo:/app/demo:ro", compose)


if __name__ == "__main__":
    unittest.main()
