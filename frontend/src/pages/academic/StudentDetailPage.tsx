import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { getStudentById } from "../../api/academicApi";
import { getAnalyticsEvents } from "../../api/supportApi";
import { DataTable } from "../../components/DataTable";
import { EmptyState } from "../../components/EmptyState";
import { PageHeader } from "../../components/PageHeader";
import { StatusBadge } from "../../components/StatusBadge";
import type { Student } from "../../types/academic";
import type { AnalyticsEvent } from "../../types/support";
import { getStudentEvents } from "./studentEvents";

export function StudentDetailPage() {
  const { studentId } = useParams();
  const [student, setStudent] = useState<Student | null>(null);
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [historyError, setHistoryError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadStudent() {
      if (!studentId) {
        setError("Identificador de estudiante invalido.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const data = await getStudentById(studentId);

        if (isMounted) {
          setStudent(data);
        }

        try {
          const analyticsEvents = await getAnalyticsEvents();
          if (isMounted) setEvents(getStudentEvents(analyticsEvents, studentId));
        } catch {
          if (isMounted) setHistoryError("No se pudo cargar el historial de eventos.");
        }
      } catch {
        if (isMounted) {
          setError("No se pudo cargar el detalle del estudiante.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadStudent();

    return () => {
      isMounted = false;
    };
  }, [studentId]);

  return (
    <div className="page-panel">
      <PageHeader
        kicker="Portal Académico"
        title="Detalle de estudiante"
        description="Datos principales obtenidos desde Academic Service."
        action={
          <Link className="button secondary" to="/academic/students">
            Volver
          </Link>
        }
      />

      {isLoading ? <div className="state-message">Cargando estudiante...</div> : null}
      {error ? <div className="alert error">{error}</div> : null}

      {!isLoading && !error && student ? (
        <>
          <dl className="detail-grid">
          <div>
            <dt>Nombre</dt>
            <dd>
              {student.first_name} {student.last_name}
            </dd>
          </div>
          <div>
            <dt>Estado</dt>
            <dd>
              <StatusBadge status={student.enrollment_status} />
            </dd>
          </div>
          <div>
            <dt>Estado financiero</dt>
            <dd>
              <StatusBadge status={student.financial_status} />
            </dd>
          </div>
          <div>
            <dt>Ultimo pago confirmado</dt>
            <dd>{student.last_confirmed_payment_id ?? "No registrado"}</dd>
          </div>
          <div>
            <dt>Documento</dt>
            <dd>{student.document_number}</dd>
          </div>
          <div>
            <dt>School ID</dt>
            <dd>{student.school_id}</dd>
          </div>
          <div>
            <dt>Grado</dt>
            <dd>{student.grade}</dd>
          </div>
          <div>
            <dt>Anio academico</dt>
            <dd>{student.academic_year}</dd>
          </div>
          <div>
            <dt>Creado</dt>
            <dd>{new Date(student.created_at).toLocaleString()}</dd>
          </div>
          <div>
            <dt>Actualizado</dt>
            <dd>{new Date(student.updated_at).toLocaleString()}</dd>
          </div>
          <div>
            <dt>Estado financiero actualizado</dt>
            <dd>
              {student.financial_status_updated_at
                ? new Date(student.financial_status_updated_at).toLocaleString()
                : "No registrado"}
            </dd>
          </div>
          </dl>

          <section className="section-block">
            <h3>Historial básico de eventos</h3>
            <p className="section-description">Eventos asociados al estudiante y consolidados por Analytics Service.</p>
            {historyError ? <div className="alert error">{historyError}</div> : null}
            {!historyError && events.length === 0 ? (
              <EmptyState title="Sin eventos" description="Todavía no existen eventos asociados al estudiante." />
            ) : null}
            {!historyError && events.length > 0 ? (
              <DataTable
                data={events}
                getRowKey={(event) => event.analytics_event_id}
                columns={[
                  { header: "Evento", render: (event) => event.event_type },
                  { header: "Correlation ID", render: (event) => event.correlation_id ?? "No disponible" },
                  {
                    header: "Fecha",
                    render: (event) => new Date(event.occurred_at ?? event.processed_at).toLocaleString(),
                  },
                ]}
              />
            ) : null}
          </section>
        </>
      ) : null}
    </div>
  );
}
