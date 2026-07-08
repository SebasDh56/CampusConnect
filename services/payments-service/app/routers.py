from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Payment
from app.schemas import PaymentCreate, PaymentRead

router = APIRouter()


@router.post("/payments", response_model=PaymentRead, status_code=status.HTTP_201_CREATED)
def create_payment(payload: PaymentCreate, db: Session = Depends(get_db)) -> Payment:
    payment = Payment(**payload.model_dump())
    db.add(payment)
    db.commit()
    db.refresh(payment)
    return payment


@router.get("/payments", response_model=list[PaymentRead])
def list_payments(db: Session = Depends(get_db)) -> list[Payment]:
    return list(db.scalars(select(Payment).order_by(Payment.created_at.desc())).all())


@router.get("/payments/{payment_id}", response_model=PaymentRead)
def get_payment(payment_id: str, db: Session = Depends(get_db)) -> Payment:
    payment = db.get(Payment, payment_id)
    if payment is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment not found")
    return payment
