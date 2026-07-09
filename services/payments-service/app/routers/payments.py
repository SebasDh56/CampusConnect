from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app import crud
from app.database import get_db
from app.models import Payment
from app.schemas import PaymentCreate, PaymentRead, PaymentUpdate

router = APIRouter(tags=["payments"])


def _get_payment_or_404(payment_id: UUID, db: Session) -> Payment:
    payment = crud.get_payment_by_id(db, payment_id)
    if payment is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment not found")
    return payment


@router.post("/payments", response_model=PaymentRead, status_code=status.HTTP_201_CREATED)
def create_payment(payload: PaymentCreate, db: Session = Depends(get_db)) -> Payment:
    try:
        return crud.create_payment(db, payload)
    except crud.DuplicateInvoiceIdError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="invoice_id already exists") from exc


@router.get("/payments", response_model=list[PaymentRead])
def get_payments(db: Session = Depends(get_db)) -> list[Payment]:
    return crud.get_payments(db)


@router.get("/payments/{payment_id}", response_model=PaymentRead)
def get_payment(payment_id: UUID, db: Session = Depends(get_db)) -> Payment:
    return _get_payment_or_404(payment_id, db)


@router.put("/payments/{payment_id}", response_model=PaymentRead)
def update_payment(payment_id: UUID, payload: PaymentUpdate, db: Session = Depends(get_db)) -> Payment:
    payment = _get_payment_or_404(payment_id, db)
    try:
        return crud.update_payment(db, payment, payload)
    except crud.DuplicateInvoiceIdError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="invoice_id already exists") from exc


@router.delete("/payments/{payment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_payment(payment_id: UUID, db: Session = Depends(get_db)) -> Response:
    payment = _get_payment_or_404(payment_id, db)
    crud.delete_payment(db, payment)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
