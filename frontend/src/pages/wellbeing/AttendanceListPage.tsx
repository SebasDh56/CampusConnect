import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getAttendance } from "../../api/wellbeingApi";
import { DataTable } from "../../components/DataTable";
import { EmptyState } from "../../components/EmptyState";
import { PageHeader } from "../../components/PageHeader";
import { StatusBadge } from "../../components/StatusBadge";
import type { Attendance } from "../../types/wellbeing";

export function AttendanceListPage() {
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadAttendance() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getAttendance();

        if (isMounted) {
          setAttendance(data);
        }
      } catch {
        if (isMounted) {
          setError("No se pudo cargar el listado de asistencias.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadAttendance();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="page-panel">
      <PageHeader
        kicker="Bienestar / Docente"
        title="Listado de asistencias"
        description="Consulta los registros de asistencia guardados en Wellbeing Service."
        action={
          <Link className="button primary" to="/wellbeing/attendance/new">
            Registrar asistencia
          </Link>
        }
      />

      {isLoading ? <div className="state-message">Cargando asistencias...</div> : null}
      {error ? <div className="alert error">{error}</div> : null}

      {!isLoading && !error && attendance.length === 0 ? (
        <EmptyState
          title="No hay asistencias registradas"
          description="Registra la primera asistencia para comenzar a operar Bienestar."
        />
      ) : null}

      {!isLoading && !error && attendance.length > 0 ? (
        <DataTable
          data={attendance}
          getRowKey={(item) => item.attendance_id}
          columns={[
            {
              header: "Fecha",
              render: (item) => item.record_date,
            },
            {
              header: "Estudiante",
              render: (item) => item.student_id,
            },
            {
              header: "Grado",
              render: (item) => item.grade,
            },
            {
              header: "Estado",
              render: (item) => <StatusBadge status={item.status} />,
            },
            {
              header: "Registrado por",
              render: (item) => item.recorded_by,
            },
          ]}
        />
      ) : null}
    </div>
  );
}
