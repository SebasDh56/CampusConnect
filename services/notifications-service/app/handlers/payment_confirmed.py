from app.models import Notification


def handle_payment_confirmed(event: dict) -> Notification:
    data = event["data"]

    return Notification(
        event_id=event["eventId"],
        event_type=event["eventType"],
        correlation_id=event.get("correlationId"),
        recipient_type="STUDENT",
        recipient_reference=data.get("studentId"),
        title="Payment confirmed",
        message=(
            f"Payment {data.get('paymentId')} for invoice {data.get('invoiceId')} "
            f"was confirmed for {data.get('amount')} {data.get('currency')}."
        ),
        status="CREATED",
    )
