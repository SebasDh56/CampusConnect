import unittest
from unittest.mock import MagicMock

from app.config import settings
from app.consumer import AnalyticsConsumer


class AnalyticsTopologyTests(unittest.TestCase):
    def test_active_queue_dead_letters_rejected_messages(self) -> None:
        channel = MagicMock()

        AnalyticsConsumer()._declare_topology(channel)

        channel.exchange_declare.assert_any_call(
            exchange=settings.rabbitmq_dead_letter_exchange,
            exchange_type="direct",
            durable=True,
        )
        channel.queue_declare.assert_any_call(
            queue=settings.rabbitmq_queue,
            durable=True,
            arguments={
                "x-dead-letter-exchange": settings.rabbitmq_dead_letter_exchange,
                "x-dead-letter-routing-key": settings.rabbitmq_dead_letter_routing_key,
            },
        )


if __name__ == "__main__":
    unittest.main()
