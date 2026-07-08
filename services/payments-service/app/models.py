from datetime import datetime
from decimal import Decimal
from uuid import uuid4

from sqlalchemy import DateTime, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Payment(Base):
    __tablename__ = "payments"

    payment_id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    student_id: Mapped[str] = mapped_column(String(36), nullable=False, index=True)
    school_id: Mapped[str | None] = mapped_column(String(36), nullable=True)
    invoice_id: Mapped[str | None] = mapped_column(String(36), nullable=True)
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    currency: Mapped[str] = mapped_column(String(3), nullable=False, default="USD")
    payment_method: Mapped[str | None] = mapped_column(String(50), nullable=True)
    payment_status: Mapped[str] = mapped_column(String(30), nullable=False, default="PENDING")
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)
