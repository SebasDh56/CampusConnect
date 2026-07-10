import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getPayments } from "../../api/paymentsApi";
import { DataTable } from "../../components/DataTable";
import { EmptyState } from "../../components/EmptyState";
import { PageHeader } from "../../components/PageHeader";
import { StatusBadge } from "../../components/StatusBadge";
import type { Payment } from "../../types/payments";

const confirmedStatuses = new Set(["PAID", "CONFIRMED"]);

function formatAmount(payment: Payment) {
  return `${payment.amount} ${payment.currency}`;
}

export function PaymentsListPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadPayments() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getPayments();

        if (isMounted) {
          setPayments(data);
        }
      } catch {
        if (isMounted) {
          setError("No se pudo cargar el listado de pagos.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadPayments();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="page-panel">
      <PageHeader
        kicker="Portal Financiero"
        title="Listado de pagos"
        description="Consulta pagos registrados en Payments Service."
        action={
          <Link className="button primary" to="/payments/new">
            Registrar pago
          </Link>
        }
      />

      {isLoading ? <div className="state-message">Cargando pagos...</div> : null}
      {error ? <div className="alert error">{error}</div> : null}

      {!isLoading && !error && payments.length === 0 ? (
        <EmptyState
          title="No hay pagos registrados"
          description="Registra un pago para comenzar a operar el portal financiero."
        />
      ) : null}

      {!isLoading && !error && payments.length > 0 ? (
        <DataTable
          data={payments}
          getRowKey={(payment) => payment.payment_id}
          columns={[
            {
              header: "Factura",
              render: (payment) => payment.invoice_id,
            },
            {
              header: "Estudiante",
              render: (payment) => payment.student_id,
            },
            {
              header: "Monto",
              render: formatAmount,
            },
            {
              header: "Metodo",
              render: (payment) => payment.payment_method,
            },
            {
              header: "Estado",
              render: (payment) => <StatusBadge status={payment.payment_status} />,
            },
            {
              header: "Accion",
              render: (payment) =>
                confirmedStatuses.has(payment.payment_status) ? (
                  <span className="muted-text">Confirmado</span>
                ) : (
                  <Link className="table-link" to={`/payments/${payment.payment_id}/confirm`}>
                    Confirmar pago
                  </Link>
                ),
            },
          ]}
        />
      ) : null}
    </div>
  );
}
