import { useEffect, useMemo, useState, type ChangeEvent } from "react";

import { getStudents } from "../api/academicApi";
import type { Student } from "../types/academic";
import { FormField } from "./FormField";

type StudentSelectorProps = {
  value: string;
  onSelect: (student: Student | null) => void;
  error?: string;
};

export function StudentSelector({ value, onSelect, error }: StudentSelectorProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    getStudents()
      .then((items) => {
        if (isMounted) setStudents(items);
      })
      .catch(() => {
        if (isMounted) setLoadError("No se pudieron consultar los estudiantes.");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const options = useMemo(
    () => [
      {
        label: isLoading ? "Cargando estudiantes..." : "Selecciona un estudiante",
        value: "",
      },
      ...students.map((student) => ({
        label: `${student.first_name} ${student.last_name} - ${student.document_number} (${student.grade})`,
        value: student.student_id,
      })),
    ],
    [isLoading, students],
  );

  function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    const student = students.find((item) => item.student_id === event.target.value) ?? null;
    onSelect(student);
  }

  return (
    <>
      <FormField
        as="select"
        label="Estudiante"
        name="student_id"
        value={value}
        onChange={handleChange}
        options={options}
        error={error}
        disabled={isLoading || Boolean(loadError)}
        required
      />
      {loadError ? <div className="alert error">{loadError}</div> : null}
    </>
  );
}
