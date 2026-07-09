import json
import logging
import threading
import time
from datetime import datetime

import pika
from pika.adapters.blocking_connection import BlockingChannel
from pika.spec import Basic, BasicProperties
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.config import settings
from app.database import SessionLocal
from app.handlers import build_analytics_event
from app.models import ProcessedEvent

logger = logging.getLogger(__name__)

ROUTING_KEYS = (
    "student.enrolled",
    "payment.confirmed",
    "attendance.recorded",
    "incident.reported",
)


class AnalyticsConsumer:
    def __init__(self) -> None:
        self._connection: pika.BlockingConnection | None = None
        self._thread: threading.Thread | None = None
        self._stopping = threading.Event()

    def start(self) -> None:
        if self._thread is not None and self._thread.is_alive():
            return

        self._thread = threading.Thread(target=self._run, name="analytics-consumer", daemon=True)
        self._thread.start()

    def stop(self) -> None:
        self._stopping.set()
        if self._connection is not None and self._connection.is_open:
            self._connection.close()

    def _run(self) -> None:
        while not self._stopping.is_set():
            try:
                self._connection = pika.BlockingConnection(self._connection_parameters())
                channel = self._connection.channel()
                self._declare_topology(channel)
                channel.basic_qos(prefetch_count=1)
                channel.basic_consume(
                    queue=settings.rabbitmq_queue,
                    on_message_callback=self._handle_message,
                    auto_ack=False,
                )
                logger.info("analytics_consumer_started queue=%s", settings.rabbitmq_queue)
                channel.start_consuming()
            except Exception:
                if not self._stopping.is_set():
                    logger.exception("analytics_consumer_connection_failed")
                    time.sleep(5)

    def _connection_parameters(self) -> pika.ConnectionParameters:
        credentials = pika.PlainCredentials(settings.rabbitmq_user, settings.rabbitmq_password)
        return pika.ConnectionParameters(
            host=settings.rabbitmq_host,
            port=settings.rabbitmq_port,
            virtual_host=settings.rabbitmq_vhost,
            credentials=credentials,
        )

    def _declare_topology(self, channel: BlockingChannel) -> None:
        channel.exchange_declare(
            exchange=settings.rabbitmq_exchange,
            exchange_type="topic",
            durable=True,
        )
        channel.queue_declare(queue=settings.rabbitmq_queue, durable=True)
        for routing_key in ROUTING_KEYS:
            channel.queue_bind(
                queue=settings.rabbitmq_queue,
                exchange=settings.rabbitmq_exchange,
                routing_key=routing_key,
            )

    def _handle_message(
        self,
        channel: BlockingChannel,
        method: Basic.Deliver,
        properties: BasicProperties,
        body: bytes,
    ) -> None:
        routing_key = method.routing_key

        try:
            event = json.loads(body.decode("utf-8"))
        except json.JSONDecodeError as exc:
            logger.error("invalid_event_json routingKey=%s status=invalid error=%s", routing_key, exc)
            channel.basic_nack(delivery_tag=method.delivery_tag, requeue=False)
            return

        event_id = event.get("eventId")
        event_type = event.get("eventType")
        correlation_id = event.get("correlationId")

        if not event_id or not event_type or "data" not in event:
            logger.error(
                "invalid_event eventId=%s eventType=%s correlationId=%s routingKey=%s status=invalid",
                event_id,
                event_type,
                correlation_id,
                routing_key,
            )
            channel.basic_nack(delivery_tag=method.delivery_tag, requeue=False)
            return

        db = SessionLocal()
        try:
            if self._is_duplicate(db, event_id):
                logger.info(
                    "duplicate_event_ignored eventId=%s eventType=%s correlationId=%s routingKey=%s status=duplicate",
                    event_id,
                    event_type,
                    correlation_id,
                    routing_key,
                )
                channel.basic_ack(delivery_tag=method.delivery_tag)
                return

            processed_event = ProcessedEvent(
                event_id=event_id,
                event_type=event_type,
                correlation_id=correlation_id,
                routing_key=routing_key,
                status="PROCESSED",
                attempts=1,
                processed_at=datetime.utcnow(),
            )
            analytics_event = build_analytics_event(event, routing_key)

            db.add(processed_event)
            db.add(analytics_event)
            db.commit()

            logger.info(
                "event_processed eventId=%s eventType=%s correlationId=%s routingKey=%s status=processed",
                event_id,
                event_type,
                correlation_id,
                routing_key,
            )
            channel.basic_ack(delivery_tag=method.delivery_tag)
        except IntegrityError:
            db.rollback()
            logger.info(
                "duplicate_event_ignored eventId=%s eventType=%s correlationId=%s routingKey=%s status=duplicate",
                event_id,
                event_type,
                correlation_id,
                routing_key,
            )
            channel.basic_ack(delivery_tag=method.delivery_tag)
        except Exception as exc:
            db.rollback()
            self._record_failure(event, routing_key, str(exc))
            logger.exception(
                "event_processing_failed eventId=%s eventType=%s correlationId=%s routingKey=%s status=failed",
                event_id,
                event_type,
                correlation_id,
                routing_key,
            )
            channel.basic_nack(delivery_tag=method.delivery_tag, requeue=False)
        finally:
            db.close()

    def _is_duplicate(self, db: Session, event_id: str) -> bool:
        return db.scalars(select(ProcessedEvent).where(ProcessedEvent.event_id == event_id)).first() is not None

    def _record_failure(self, event: dict, routing_key: str, error: str) -> None:
        db = SessionLocal()
        try:
            event_id = event.get("eventId")
            if not event_id or self._is_duplicate(db, event_id):
                return

            db.add(
                ProcessedEvent(
                    event_id=event_id,
                    event_type=event.get("eventType", "UNKNOWN"),
                    correlation_id=event.get("correlationId"),
                    routing_key=routing_key,
                    status="FAILED",
                    attempts=1,
                    failed_at=datetime.utcnow(),
                    last_error=error,
                )
            )
            db.commit()
        except Exception:
            db.rollback()
            logger.exception("failed_to_record_processing_failure eventId=%s routingKey=%s", event.get("eventId"), routing_key)
        finally:
            db.close()
