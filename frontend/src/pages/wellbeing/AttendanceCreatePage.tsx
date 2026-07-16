import axios from "axios";
import { type ChangeEvent, type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { createAttendance } from "../../api/wellbeingApi";
import { FormField } from "../../components/FormField";
import { PageHeader } from "../../components/PageHeader";
import { StudentSelector } from "../../components/StudentSelector";
import { attendanceStudentFields } from "../studentFormSelection";
import type { AttendanceCreate } from "../../types/wellbeing";

type FormErrors = Partial<Record<keyof AttendanceCreate, string>>;

const initialForm: AttendanceCreate = {
  student_id: "",
  school_id: "",
  grade: "",
  record_date: new Date().toISOString().slice(0, 10),
  status: "PRESENT",
  recorded_by: "",
};

const attendanceStatusOptions = [
  { label: "PRESENT", value: "PRESENT" },
  { label: "ABSENT", value: "ABSENT" },
  { label: "LATE", value: "LATE" },
  { label: "JUSTIFIED_ABSENCE", value: "JUSTIFIED_ABSENCE" },
];

export function AttendanceCreatePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<AttendanceCreate>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  }

  function validate(): FormErrors {
    const nextErrors: FormErrors = {};

    Object.entries(form).forEach(([key, value]) => {
      if (!value.trim()) {
        nextErrors[key as keyof AttendanceCreate] = "Campo requerido.";
      }
    });

    return nextErrors;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    setSubmitError(null);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    try {
      setIsSubmitting(true);
      await createAttendance(form);
      navigate("/wellbeing/attendance");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 422) {
        setSubmitError("El backend rechazo la solicitud. Revisa los campos ingresados.");
        return;
      }

      setSubmitError("No se pudo registrar la asistencia.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="page-panel">
      <PageHeader
        kicker="Bienestar / Docente"
        title="Registrar asistencia"
        description="Crea un registro de asistencia en Wellbeing Service."
      />

      {submitError ? <div className="alert error">{submitError}</div> : null}

      <form className="form-grid" onSubmit={handleSubmit}>
        <StudentSelector
          value={form.student_id}
          onSelect={(student) => {
            setForm((current) => ({ ...current, ...attendanceStudentFields(student) }));
            setErrors((current) => ({
              ...current,
              student_id: undefined,
              school_id: undefined,
              grade: undefined,
            }));
          }}
          error={errors.student_id}
        />
        <div className="state-message compact">
          Colegio y grado: {form.school_id && form.grade ? `${form.school_id} - ${form.grade}` : "Sin seleccionar"}
        </div>
        <FormField
          label="Fecha"
          name="record_date"
          value={form.record_date}
          onChange={handleChange}
          error={errors.record_date}
          type="date"
          required
        />
        <FormField
          as="select"
          label="Estado"
          name="status"
          value={form.status}
          onChange={handleChange}
          options={attendanceStatusOptions}
          error={errors.status}
          required
        />
        <FormField
          label="Registrado por"
          name="recorded_by"
          value={form.recorded_by}
          onChange={handleChange}
          error={errors.recorded_by}
          required
        />

        <div className="form-actions">
          <Link className="button secondary" to="/wellbeing/attendance">
            Cancelar
          </Link>
          <button className="button primary" disabled={isSubmitting} type="submit">
            {isSubmitting ? "Guardando..." : "Guardar asistencia"}
          </button>
        </div>
      </form>
    </div>
  );
}
