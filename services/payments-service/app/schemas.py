from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class PaymentCreate(BaseModel):
    student_id: str = Field(min_length=1)
    school_id: str | None = None
    invoice_id: str | None = None
    amount: Decimal = Field(gt=0)
    currency: str = "USD"
    payment_method: str | None = None
    payment_status: str = "PENDING"


class PaymentRead(BaseModel):
    payment_id: str
    student_id: str
    school_id: str | None
    invoice_id: str | None
    amount: Decimal
    currency: str
    payment_method: str | None
    payment_status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
