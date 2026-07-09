from datetime import UTC, datetime
from uuid import uuid4

from app.models import Payment


def build_payment_confirmed_event(payment: Payment, correlation_id: str) -> dict:
    return {
        "eventId": str(uuid4()),
        "eventType": "PaymentConfirmed",
        "occurredAt": datetime.now(UTC).isoformat(),
        "correlationId": correlation_id,
        "data": {
            "paymentId": payment.payment_id,
            "studentId": payment.student_id,
            "schoolId": payment.school_id,
            "invoiceId": payment.invoice_id,
            "amount": str(payment.amount),
            "currency": payment.currency,
            "paymentMethod": payment.payment_method,
            "paymentStatus": payment.payment_status,
        },
    }
