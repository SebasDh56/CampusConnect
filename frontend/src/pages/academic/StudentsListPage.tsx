import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getStudents } from "../../api/academicApi";
import { DataTable } from "../../components/DataTable";
import { EmptyState } from "../../components/EmptyState";
import { PageHeader } from "../../components/PageHeader";
import { StatusBadge } from "../../components/StatusBadge";
import type { Student } from "../../types/academic";

export function StudentsListPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadStudents() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getStudents();

        if (isMounted) {
          setStudents(data);
        }
      } catch {
        if (isMounted) {
          setError("No se pudo cargar el listado de estudiantes.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadStudents();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="page-panel">
      <PageHeader
        kicker="Portal Academico"
        title="Listado de estudiantes"
        description="Consulta los estudiantes registrados en Academic Service."
        action={
          <Link className="button primary" to="/academic/students/new">
            Nuevo estudiante
          </Link>
        }
      />

      {isLoading ? <div className="state-message">Cargando estudiantes...</div> : null}
      {error ? <div className="alert error">{error}</div> : null}

      {!isLoading && !error && students.length === 0 ? (
        <EmptyState
          title="No hay estudiantes registrados"
          description="Crea el primer estudiante para comenzar a operar el portal academico."
        />
      ) : null}

      {!isLoading && !error && students.length > 0 ? (
        <DataTable
          data={students}
          getRowKey={(student) => student.student_id}
          columns={[
            {
              header: "Nombre",
              render: (student) => `${student.first_name} ${student.last_name}`,
            },
            {
              header: "Documento",
              render: (student) => student.document_number,
            },
            {
              header: "Grado",
              render: (student) => student.grade,
            },
            {
              header: "Anio",
              render: (student) => student.academic_year,
            },
            {
              header: "Estado",
              render: (student) => <StatusBadge status={student.enrollment_status} />,
            },
            {
              header: "Detalle",
              render: (student) => (
                <Link className="table-link" to={`/academic/students/${student.student_id}`}>
                  Ver detalle
                </Link>
              ),
            },
          ]}
        />
      ) : null}
    </div>
  );
}
