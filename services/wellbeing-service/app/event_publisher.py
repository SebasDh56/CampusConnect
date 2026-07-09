import json
import logging

import pika

from app.config import settings

logger = logging.getLogger(__name__)


def publish_event(event: dict, routing_key: str) -> bool:
    connection = None

    try:
        credentials = pika.PlainCredentials(settings.rabbitmq_user, settings.rabbitmq_password)
        parameters = pika.ConnectionParameters(
            host=settings.rabbitmq_host,
            port=settings.rabbitmq_port,
            virtual_host=settings.rabbitmq_vhost,
            credentials=credentials,
        )
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
            body=json.dumps(event).encode("utf-8"),
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
        return False
    finally:
        if connection is not None and connection.is_open:
            connection.close()
