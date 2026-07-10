import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { getStudentById } from "../../api/academicApi";
import { PageHeader } from "../../components/PageHeader";
import { StatusBadge } from "../../components/StatusBadge";
import type { Student } from "../../types/academic";

export function StudentDetailPage() {
  const { studentId } = useParams();
  const [student, setStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        kicker="Portal Academico"
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
        </dl>
      ) : null}
    </div>
  );
}
