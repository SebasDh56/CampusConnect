import axios from "axios";
import { type ChangeEvent, type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { createPayment } from "../../api/paymentsApi";
import { FormField } from "../../components/FormField";
import { PageHeader } from "../../components/PageHeader";
import { StudentSelector } from "../../components/StudentSelector";
import { paymentStudentFields } from "../studentFormSelection";
import type { PaymentCreate } from "../../types/payments";

type PaymentForm = Omit<PaymentCreate, "amount"> & {
  amount: string;
};

type FormErrors = Partial<Record<keyof PaymentForm, string>>;

const initialForm: PaymentForm = {
  student_id: "",
  school_id: "",
  invoice_id: "",
  amount: "",
  currency: "USD",
  payment_method: "",
  payment_status: "PENDING",
};

const statusOptions = [
  { label: "PENDING", value: "PENDING" },
  { label: "PAID", value: "PAID" },
  { label: "CONFIRMED", value: "CONFIRMED" },
];

export function PaymentCreatePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<PaymentForm>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  }

  function validate(): FormErrors {
    const nextErrors: FormErrors = {};

    Object.entries(form).forEach(([key, value]) => {
      if (!value.trim()) {
        nextErrors[key as keyof PaymentForm] = "Campo requerido.";
      }
    });

    const amount = Number(form.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      nextErrors.amount = "El monto debe ser mayor que 0.";
    }

    return nextErrors;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    setSubmitError(null);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    try {
      setIsSubmitting(true);
      await createPayment({
        ...form,
        amount: Number(form.amount),
      });
      navigate("/payments");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 409) {
          setSubmitError("Ya existe un pago con ese invoice_id.");
          return;
        }

        if (error.response?.status === 422) {
          setSubmitError("El backend rechazo la solicitud. Revisa los campos ingresados.");
          return;
        }
      }

      setSubmitError("No se pudo registrar el pago.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="page-panel">
      <PageHeader
        kicker="Portal Financiero"
        title="Registrar pago"
        description="Crea un pago en Payments Service. Si nace como PAID o CONFIRMED, el backend publicara PaymentConfirmed."
      />

      {submitError ? <div className="alert error">{submitError}</div> : null}

      <form className="form-grid" onSubmit={handleSubmit}>
        <StudentSelector
          value={form.student_id}
          onSelect={(student) => {
            setForm((current) => ({ ...current, ...paymentStudentFields(student) }));
            setErrors((current) => ({ ...current, student_id: undefined, school_id: undefined }));
          }}
          error={errors.student_id}
        />
        <div className="state-message compact">Colegio seleccionado: {form.school_id || "Ninguno"}</div>
        <FormField
          label="Invoice ID"
          name="invoice_id"
          value={form.invoice_id}
          onChange={handleChange}
          error={errors.invoice_id}
          required
        />
        <FormField
          label="Monto"
          name="amount"
          value={form.amount}
          onChange={handleChange}
          error={errors.amount}
          min="0.01"
          step="0.01"
          type="number"
          required
        />
        <FormField
          label="Moneda"
          name="currency"
          value={form.currency}
          onChange={handleChange}
          error={errors.currency}
          required
        />
        <FormField
          label="Metodo de pago"
          name="payment_method"
          value={form.payment_method}
          onChange={handleChange}
          error={errors.payment_method}
          required
        />
        <FormField
          as="select"
          label="Estado"
          name="payment_status"
          value={form.payment_status}
          onChange={handleChange}
          options={statusOptions}
          error={errors.payment_status}
          required
        />

        <div className="form-actions">
          <Link className="button secondary" to="/payments">
            Cancelar
          </Link>
          <button className="button primary" disabled={isSubmitting} type="submit">
            {isSubmitting ? "Guardando..." : "Guardar pago"}
          </button>
        </div>
      </form>
    </div>
  );
}
