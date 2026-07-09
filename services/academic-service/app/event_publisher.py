import json
import logging
from collections.abc import Iterator

import pika

from app.config import settings

logger = logging.getLogger(__name__)


def _connection_parameters() -> Iterator[pika.ConnectionParameters]:
    credentials = pika.PlainCredentials(settings.rabbitmq_user, settings.rabbitmq_password)
    yield pika.ConnectionParameters(
        host=settings.rabbitmq_host,
        port=settings.rabbitmq_port,
        virtual_host=settings.rabbitmq_vhost,
        credentials=credentials,
    )

    # Compatibility with the existing local infrastructure, which currently
    # provisions the default vhost and campusconnect/campusconnect credentials.
    if (
        settings.rabbitmq_user,
        settings.rabbitmq_password,
        settings.rabbitmq_vhost,
    ) == ("campus_user", "campus_pass", "campusconnect"):
        fallback_credentials = pika.PlainCredentials("campusconnect", "campusconnect")
        yield pika.ConnectionParameters(
            host=settings.rabbitmq_host,
            port=settings.rabbitmq_port,
            virtual_host="/",
            credentials=fallback_credentials,
        )


def publish_event(event: dict, routing_key: str) -> bool:
    body = json.dumps(event).encode("utf-8")

    for parameters in _connection_parameters():
        connection = None
        try:
            connection = pika.BlockingConnection(parameters)
            channel = connection.channel()
            channel.exchange_declare(
                exchange=settings.rabbitmq_exchange,
                exchange_type="topic",
                durable=True,
            )
            channel.basic_publish(
                exchange=settings.rabbitmq_exchange,
                routing_key=routing_key,
                body=body,
                properties=pika.BasicProperties(
                    content_type="application/json",
                    delivery_mode=2,
                ),
            )
            logger.info(
                "Published event %s with routing key %s",
                event.get("eventType"),
                routing_key,
            )
            return True
        except Exception:
            logger.exception(
                "Failed to publish event %s with routing key %s",
                event.get("eventType"),
                routing_key,
            )
        finally:
            if connection is not None and connection.is_open:
                connection.close()

    return False
