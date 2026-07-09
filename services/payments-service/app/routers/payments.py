from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy.orm import Session

from app import crud
from app.database import get_db
from app.event_factory import build_payment_confirmed_event
from app.event_publisher import publish_event
from app.models import Payment
from app.schemas import PaymentCreate, PaymentRead, PaymentUpdate

router = APIRouter(tags=["payments"])
CONFIRMED_PAYMENT_STATUSES = {"CONFIRMED", "PAID"}


def _get_payment_or_404(payment_id: UUID, db: Session) -> Payment:
    payment = crud.get_payment_by_id(db, payment_id)
    if payment is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment not found")
    return payment


def _is_confirmed_status(payment_status: str | None) -> bool:
    return payment_status in CONFIRMED_PAYMENT_STATUSES


def _publish_payment_confirmed(payment: Payment, request: Request) -> None:
    correlation_id = request.headers.get("X-Correlation-Id") or str(uuid4())
    event = build_payment_confirmed_event(payment, correlation_id)
    publish_event(event, "payment.confirmed")


@router.post("/payments", response_model=PaymentRead, status_code=status.HTTP_201_CREATED)
def create_payment(request: Request, payload: PaymentCreate, db: Session = Depends(get_db)) -> Payment:
    try:
        payment = crud.create_payment(db, payload)
    except crud.DuplicateInvoiceIdError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="invoice_id already exists") from exc

    if _is_confirmed_status(payment.payment_status):
        _publish_payment_confirmed(payment, request)

    return payment


@router.get("/payments", response_model=list[PaymentRead])
def get_payments(db: Session = Depends(get_db)) -> list[Payment]:
    return crud.get_payments(db)


@router.get("/payments/{payment_id}", response_model=PaymentRead)
def get_payment(payment_id: UUID, db: Session = Depends(get_db)) -> Payment:
    return _get_payment_or_404(payment_id, db)


@router.put("/payments/{payment_id}", response_model=PaymentRead)
def update_payment(payment_id: UUID, request: Request, payload: PaymentUpdate, db: Session = Depends(get_db)) -> Payment:
    payment = _get_payment_or_404(payment_id, db)
    previous_status = payment.payment_status

    try:
        updated_payment = crud.update_payment(db, payment, payload)
    except crud.DuplicateInvoiceIdError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="invoice_id already exists") from exc

    if not _is_confirmed_status(previous_status) and _is_confirmed_status(updated_payment.payment_status):
        _publish_payment_confirmed(updated_payment, request)

    return updated_payment


@router.delete("/payments/{payment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_payment(payment_id: UUID, db: Session = Depends(get_db)) -> Response:
    payment = _get_payment_or_404(payment_id, db)
    crud.delete_payment(db, payment)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
