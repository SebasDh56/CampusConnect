from datetime import datetime
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models import Payment
from app.schemas import PaymentCreate, PaymentUpdate


class DuplicateInvoiceIdError(Exception):
    pass


def _invoice_id_exists(db: Session, invoice_id: str, excluded_payment_id: UUID | None = None) -> bool:
    query = select(Payment).where(Payment.invoice_id == invoice_id)
    if excluded_payment_id is not None:
        query = query.where(Payment.payment_id != str(excluded_payment_id))
    return db.scalars(query).first() is not None


def create_payment(db: Session, payload: PaymentCreate) -> Payment:
    if _invoice_id_exists(db, payload.invoice_id):
        raise DuplicateInvoiceIdError

    payment = Payment(**payload.model_dump())
    db.add(payment)

    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise DuplicateInvoiceIdError from exc

    db.refresh(payment)
    return payment


def get_payments(db: Session) -> list[Payment]:
    return list(db.scalars(select(Payment).order_by(Payment.created_at.desc())).all())


def get_payment_by_id(db: Session, payment_id: UUID) -> Payment | None:
    return db.get(Payment, str(payment_id))


def update_payment(db: Session, payment: Payment, payload: PaymentUpdate) -> Payment:
    update_data = payload.model_dump(exclude_unset=True)
    invoice_id = update_data.get("invoice_id")

    if invoice_id is not None and _invoice_id_exists(
        db,
        invoice_id,
        excluded_payment_id=UUID(payment.payment_id),
    ):
        raise DuplicateInvoiceIdError

    for field, value in update_data.items():
        setattr(payment, field, value)

    payment.updated_at = datetime.utcnow()

    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise DuplicateInvoiceIdError from exc

    db.refresh(payment)
    return payment


def delete_payment(db: Session, payment: Payment) -> None:
    db.delete(payment)
    db.commit()
