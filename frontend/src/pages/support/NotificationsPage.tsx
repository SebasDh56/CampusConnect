import { useEffect, useState } from "react";

import { getNotifications } from "../../api/supportApi";
import { DataTable } from "../../components/DataTable";
import { EmptyState } from "../../components/EmptyState";
import { PageHeader } from "../../components/PageHeader";
import { StatusBadge } from "../../components/StatusBadge";
import type { Notification } from "../../types/support";

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    getNotifications()
      .then((data) => {
        if (isMounted) setNotifications(data);
      })
      .catch(() => {
        if (isMounted) setError("No se pudieron cargar las notificaciones.");
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
        title="Notificaciones"
        description="Notificaciones simuladas generadas por los eventos del ecosistema."
      />

      {isLoading ? <div className="state-message">Cargando notificaciones...</div> : null}
      {error ? <div className="alert error">{error}</div> : null}
      {!isLoading && !error && notifications.length === 0 ? (
        <EmptyState title="Sin notificaciones" description="Todavia no se han procesado eventos notificables." />
      ) : null}
      {!isLoading && !error && notifications.length > 0 ? (
        <DataTable
          data={notifications}
          getRowKey={(item) => item.notification_id}
          columns={[
            { header: "Titulo", render: (item) => item.title },
            { header: "Evento", render: (item) => item.event_type },
            { header: "Destinatario", render: (item) => item.recipient_reference ?? item.recipient_type },
            { header: "Estado", render: (item) => <StatusBadge status={item.status} /> },
            { header: "Fecha", render: (item) => new Date(item.created_at).toLocaleString() },
          ]}
        />
      ) : null}
    </div>
  );
}
