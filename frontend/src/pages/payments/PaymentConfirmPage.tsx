import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { confirmPayment, getPaymentById } from "../../api/paymentsApi";
import { PageHeader } from "../../components/PageHeader";
import { StatusBadge } from "../../components/StatusBadge";
import type { Payment } from "../../types/payments";

const confirmedStatuses = new Set(["PAID", "CONFIRMED"]);

export function PaymentConfirmPage() {
  const { paymentId } = useParams();
  const navigate = useNavigate();
  const [payment, setPayment] = useState<Payment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadPayment() {
      if (!paymentId) {
        setError("Identificador de pago invalido.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const data = await getPaymentById(paymentId);

        if (isMounted) {
          setPayment(data);
        }
      } catch {
        if (isMounted) {
          setError("No se pudo cargar el pago.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadPayment();

    return () => {
      isMounted = false;
    };
  }, [paymentId]);

  async function handleConfirm() {
    if (!payment) {
      return;
    }

    try {
      setIsConfirming(true);
      setError(null);
      await confirmPayment(payment);
      navigate("/payments");
    } catch {
      setError("No se pudo confirmar el pago.");
    } finally {
      setIsConfirming(false);
    }
  }

  return (
    <div className="page-panel">
      <PageHeader
        kicker="Portal Financiero"
        title="Confirmar pago"
        description="Revisa el pago y confirma el estado como PAID preservando sus datos actuales."
        action={
          <Link className="button secondary" to="/payments">
            Volver
          </Link>
        }
      />

      {isLoading ? <div className="state-message">Cargando pago...</div> : null}
      {error ? <div className="alert error">{error}</div> : null}

      {!isLoading && payment ? (
        <>
          <dl className="detail-grid">
            <div>
              <dt>Factura</dt>
              <dd>{payment.invoice_id}</dd>
            </div>
            <div>
              <dt>Estado</dt>
              <dd>
                <StatusBadge status={payment.payment_status} />
              </dd>
            </div>
            <div>
              <dt>Estudiante</dt>
              <dd>{payment.student_id}</dd>
            </div>
            <div>
              <dt>School ID</dt>
              <dd>{payment.school_id}</dd>
            </div>
            <div>
              <dt>Monto</dt>
              <dd>
                {payment.amount} {payment.currency}
              </dd>
            </div>
            <div>
              <dt>Metodo</dt>
              <dd>{payment.payment_method}</dd>
            </div>
          </dl>

          <div className="form-actions">
            {confirmedStatuses.has(payment.payment_status) ? (
              <span className="state-message compact">Este pago ya esta confirmado.</span>
            ) : (
              <button className="button primary" disabled={isConfirming} onClick={handleConfirm} type="button">
                {isConfirming ? "Confirmando..." : "Confirmar pago"}
              </button>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
