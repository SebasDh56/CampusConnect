import { gatewayHttp } from "./http";
import type { Payment, PaymentCreate, PaymentUpdate } from "../types/payments";

export async function getPayments(): Promise<Payment[]> {
  const response = await gatewayHttp.get<Payment[]>("/payments/payments");
  return response.data;
}

export async function getPaymentById(paymentId: string): Promise<Payment> {
  const response = await gatewayHttp.get<Payment>(`/payments/payments/${paymentId}`);
  return response.data;
}

export async function createPayment(payload: PaymentCreate): Promise<Payment> {
  const response = await gatewayHttp.post<Payment>("/payments/payments", payload);
  return response.data;
}

export async function updatePayment(paymentId: string, payload: PaymentUpdate): Promise<Payment> {
  const response = await gatewayHttp.put<Payment>(`/payments/payments/${paymentId}`, payload);
  return response.data;
}

export async function confirmPayment(payment: Payment): Promise<Payment> {
  return updatePayment(payment.payment_id, {
    student_id: payment.student_id,
    school_id: payment.school_id,
    invoice_id: payment.invoice_id,
    amount: Number(payment.amount),
    currency: payment.currency,
    payment_method: payment.payment_method,
    payment_status: "PAID",
  });
}
