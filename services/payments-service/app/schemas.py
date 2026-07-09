from datetime import datetime
from decimal import Decimal

from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class PaymentBase(BaseModel):
    student_id: str = Field(min_length=1, max_length=36)
    school_id: str = Field(min_length=1, max_length=36)
    invoice_id: str = Field(min_length=1, max_length=36)
    amount: Decimal = Field(gt=0)
    currency: str = Field(default="USD", min_length=3, max_length=3)
    payment_method: str = Field(min_length=1, max_length=50)
    payment_status: str = Field(default="PENDING", min_length=1, max_length=30)


class PaymentCreate(PaymentBase):
    pass


class PaymentUpdate(BaseModel):
    student_id: str | None = Field(default=None, min_length=1, max_length=36)
    school_id: str | None = Field(default=None, min_length=1, max_length=36)
    invoice_id: str | None = Field(default=None, min_length=1, max_length=36)
    amount: Decimal | None = Field(default=None, gt=0)
    currency: str | None = Field(default=None, min_length=3, max_length=3)
    payment_method: str | None = Field(default=None, min_length=1, max_length=50)
    payment_status: str | None = Field(default=None, min_length=1, max_length=30)


class PaymentRead(BaseModel):
    payment_id: UUID
    student_id: str
    school_id: str
    invoice_id: str
    amount: Decimal
    currency: str
    payment_method: str
    payment_status: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
