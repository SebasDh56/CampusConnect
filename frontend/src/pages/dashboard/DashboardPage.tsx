import { useEffect, useMemo, useState } from "react";

import { getDashboardData } from "../../api/dashboardApi";
import { EmptyState } from "../../components/EmptyState";
import { EventSummary } from "../../components/EventSummary";
import { MetricCard } from "../../components/MetricCard";
import { PageHeader } from "../../components/PageHeader";
import { StatusBadge } from "../../components/StatusBadge";
import { SystemStatus } from "../../components/SystemStatus";
import type { DashboardData, DashboardMetrics } from "../../types/dashboard";
import type { AnalyticsEvent } from "../../types/support";
import { calculateDashboardMetrics } from "./dashboardMetrics";

const initialMetrics: DashboardMetrics = {
  totalStudents: 0,
  confirmedPayments: 0,
  pendingPayments: 0,
  attendanceCount: 0,
  incidentsCount: 0,
  processedEvents: 0,
  failedMessages: 0,
  notificationsCount: 0,
};

function countBy<T>(items: T[], getKey: (item: T) => string) {
  return items.reduce<Record<string, number>>((accumulator, item) => {
    const key = getKey(item);
    accumulator[key] = (accumulator[key] ?? 0) + 1;
    return accumulator;
  }, {});
}

function eventDate(event: AnalyticsEvent) {
  return event.occurred_at ?? event.processed_at;
}

function formatDate(value: string | null) {
  if (!value) {
    return "Fecha no disponible";
  }

  return new Date(value).toLocaleString();
}

function hasAnyData(data: DashboardData | null) {
  if (!data) {
    return false;
  }

  return (
    data.students.length > 0 ||
    data.payments.length > 0 ||
    data.attendance.length > 0 ||
    data.incidents.length > 0 ||
    data.analyticsEvents.length > 0 ||
    data.analyticsProcessedEvents.length > 0 ||
    data.notifications.length > 0
  );
}

export function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);

  async function loadDashboard() {
    setIsLoading(true);

    try {
      const dashboardData = await getDashboardData();
      setData(dashboardData);
      setLastUpdatedAt(new Date());
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const metrics = useMemo<DashboardMetrics>(() => {
    if (!data) {
      return initialMetrics;
    }

    return calculateDashboardMetrics(data);
  }, [data]);

  const eventCounts = useMemo(
    () => countBy(data?.analyticsEvents ?? [], (event) => event.event_type),
    [data],
  );

  const recentEvents = useMemo(() => {
    return [...(data?.analyticsEvents ?? [])]
      .sort((left, right) => {
        return new Date(eventDate(right)).getTime() - new Date(eventDate(left)).getTime();
      })
      .slice(0, 5);
  }, [data]);

  const failedServices = data?.serviceAvailability.filter((service) => !service.available) ?? [];

  return (
    <div className="dashboard-page">
      <PageHeader
        kicker="Dashboard"
        title="Dashboard Directivo"
        description="Vista consolidada del ecosistema CampusConnect 360."
        action={
          <button className="button primary" disabled={isLoading} onClick={loadDashboard} type="button">
            {isLoading ? "Actualizando..." : "Actualizar"}
          </button>
        }
      />

      <div className="dashboard-meta">
        <span>
          Ultima actualizacion: {lastUpdatedAt ? lastUpdatedAt.toLocaleString() : "Sin actualizar"}
        </span>
      </div>

      {isLoading ? <div className="state-message">Cargando dashboard directivo...</div> : null}

      {!isLoading && data?.ecosystemStatus === "PARCIAL" ? (
        <div className="alert warning">
          Dashboard en estado parcial. Servicios no disponibles:{" "}
          {failedServices.map((service) => service.label).join(", ")}.
        </div>
      ) : null}

      {!isLoading && data?.ecosystemStatus === "NO DISPONIBLE" ? (
        <div className="alert error">Ninguna fuente principal respondio correctamente.</div>
      ) : null}

      {!isLoading && !hasAnyData(data) ? (
        <EmptyState
          title="Sin datos disponibles"
          description="No hay informacion real disponible desde las APIs consultadas."
        />
      ) : null}

      {data ? (
        <>
          <section className="metric-grid">
            <MetricCard label="Estudiantes" value={metrics.totalStudents} helper="Matriculados" />
            <MetricCard label="Pagos confirmados" value={metrics.confirmedPayments} helper="PAID o CONFIRMED" />
            <MetricCard label="Pagos pendientes" value={metrics.pendingPayments} helper="Estado PENDING" />
            <MetricCard label="Asistencias" value={metrics.attendanceCount} helper="Registros capturados" />
            <MetricCard label="Incidentes" value={metrics.incidentsCount} helper="Reportes registrados" />
            <MetricCard label="Eventos procesados" value={metrics.processedEvents} helper="Analytics processed-events" />
            <MetricCard label="Mensajes fallidos" value={metrics.failedMessages} helper="Eventos unicos con estado FAILED" />
            <MetricCard label="Notificaciones" value={metrics.notificationsCount} helper="Generadas" />
          </section>

          <section className="dashboard-grid two-columns">
            <SystemStatus status={data.ecosystemStatus} services={data.serviceAvailability} />
            <EventSummary counts={eventCounts} />
          </section>

          <section className="dashboard-grid two-columns">
            <article className="dashboard-card">
              <h3>Actividad reciente</h3>
              {recentEvents.length === 0 ? (
                <EmptyState title="Sin eventos" description="No hay eventos analiticos recientes." />
              ) : (
                <div className="activity-list">
                  {recentEvents.map((event) => (
                    <div className="activity-item expanded" key={event.analytics_event_id}>
                      <div>
                        <strong>{event.event_type}</strong>
                        <span>Correlation ID: {event.correlation_id ?? "No disponible"}</span>
                        <span>{formatDate(event.occurred_at ?? event.processed_at)}</span>
                      </div>
                      <StatusBadge status="PROCESSED" />
                    </div>
                  ))}
                </div>
              )}
            </article>

            <article className="dashboard-card">
              <h3>Errores por servicio</h3>
              {failedServices.length === 0 ? (
                <div className="state-message compact">Todos los servicios consultados respondieron.</div>
              ) : (
                <div className="service-status-list">
                  {failedServices.map((service) => (
                    <div className="service-status-row" key={service.key}>
                      <span>{service.label}</span>
                      <strong className="unavailable">{data.errors[service.key] ?? "No disponible"}</strong>
                    </div>
                  ))}
                </div>
              )}
            </article>
          </section>
        </>
      ) : null}
    </div>
  );
}
