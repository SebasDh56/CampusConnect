import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getIncidents } from "../../api/wellbeingApi";
import { DataTable } from "../../components/DataTable";
import { EmptyState } from "../../components/EmptyState";
import { PageHeader } from "../../components/PageHeader";
import { StatusBadge } from "../../components/StatusBadge";
import type { Incident } from "../../types/wellbeing";

export function IncidentsListPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadIncidents() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getIncidents();

        if (isMounted) {
          setIncidents(data);
        }
      } catch {
        if (isMounted) {
          setError("No se pudo cargar el listado de incidentes.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadIncidents();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="page-panel">
      <PageHeader
        kicker="Bienestar / Docente"
        title="Listado de incidentes"
        description="Consulta incidentes reportados en Wellbeing Service."
        action={
          <Link className="button primary" to="/wellbeing/incidents/new">
            Registrar incidente
          </Link>
        }
      />

      {isLoading ? <div className="state-message">Cargando incidentes...</div> : null}
      {error ? <div className="alert error">{error}</div> : null}

      {!isLoading && !error && incidents.length === 0 ? (
        <EmptyState
          title="No hay incidentes registrados"
          description="Registra el primer incidente para dar seguimiento desde Bienestar."
        />
      ) : null}

      {!isLoading && !error && incidents.length > 0 ? (
        <DataTable
          data={incidents}
          getRowKey={(item) => item.incident_id}
          columns={[
            {
              header: "Tipo",
              render: (item) => item.incident_type,
            },
            {
              header: "Severidad",
              render: (item) => <StatusBadge status={item.severity} />,
            },
            {
              header: "Estudiante",
              render: (item) => item.student_id,
            },
            {
              header: "Descripcion",
              render: (item) => item.description,
            },
            {
              header: "Reportado por",
              render: (item) => item.reported_by,
            },
          ]}
        />
      ) : null}
    </div>
  );
}
