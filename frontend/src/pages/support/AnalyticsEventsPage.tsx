import { useEffect, useState } from "react";

import { getAnalyticsEvents } from "../../api/supportApi";
import { DataTable } from "../../components/DataTable";
import { EmptyState } from "../../components/EmptyState";
import { PageHeader } from "../../components/PageHeader";
import type { AnalyticsEvent } from "../../types/support";

export function AnalyticsEventsPage() {
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    getAnalyticsEvents()
      .then((data) => {
        if (isMounted) setEvents(data);
      })
      .catch(() => {
        if (isMounted) setError("No se pudieron cargar los eventos analíticos.");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="page-panel">
      <PageHeader
        kicker="Soporte operativo"
        title="Eventos analíticos"
        description="Proyeccion consolidada de los eventos procesados por Analytics Service."
      />

      {isLoading ? <div className="state-message">Cargando eventos...</div> : null}
      {error ? <div className="alert error">{error}</div> : null}
      {!isLoading && !error && events.length === 0 ? (
        <EmptyState title="Sin eventos" description="Todavia no existen eventos en la proyeccion analitica." />
      ) : null}
      {!isLoading && !error && events.length > 0 ? (
        <DataTable
          data={events}
          getRowKey={(item) => item.analytics_event_id}
          columns={[
            { header: "Evento", render: (item) => item.event_type },
            { header: "Routing key", render: (item) => item.routing_key },
            { header: "Correlation ID", render: (item) => item.correlation_id ?? "No disponible" },
            {
              header: "Fecha",
              render: (item) => new Date(item.occurred_at ?? item.processed_at).toLocaleString(),
            },
          ]}
        />
      ) : null}
    </div>
  );
}
