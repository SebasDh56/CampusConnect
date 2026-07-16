import axios from "axios";
import { type ChangeEvent, type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { createStudent } from "../../api/academicApi";
import { FormField } from "../../components/FormField";
import { PageHeader } from "../../components/PageHeader";
import type { StudentCreate } from "../../types/academic";

const initialForm: StudentCreate = {
  school_id: "",
  first_name: "",
  last_name: "",
  document_number: "",
  grade: "",
  academic_year: "",
  enrollment_status: "ENROLLED",
};

const statusOptions = [
  { label: "ENROLLED", value: "ENROLLED" },
  { label: "ACTIVE", value: "ACTIVE" },
  { label: "INACTIVE", value: "INACTIVE" },
];

type FormErrors = Partial<Record<keyof StudentCreate, string>>;

export function StudentCreatePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<StudentCreate>(initialForm);
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
        nextErrors[key as keyof StudentCreate] = "Campo requerido.";
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
      await createStudent(form);
      navigate("/academic/students");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 409) {
          setSubmitError("Ya existe un estudiante con ese numero de documento.");
          return;
        }

        if (error.response?.status === 422) {
          setSubmitError("El backend rechazo la solicitud. Revisa los campos ingresados.");
          return;
        }
      }

      setSubmitError("No se pudo registrar el estudiante.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="page-panel">
      <PageHeader
        kicker="Portal Académico"
        title="Registrar estudiante"
        description="Crea un estudiante en Academic Service. Al guardar, el backend publicara StudentEnrolled."
      />

      {submitError ? <div className="alert error">{submitError}</div> : null}

      <form className="form-grid" onSubmit={handleSubmit}>
        <FormField
          label="School ID"
          name="school_id"
          value={form.school_id}
          onChange={handleChange}
          error={errors.school_id}
          required
        />
        <FormField
          label="Nombres"
          name="first_name"
          value={form.first_name}
          onChange={handleChange}
          error={errors.first_name}
          required
        />
        <FormField
          label="Apellidos"
          name="last_name"
          value={form.last_name}
          onChange={handleChange}
          error={errors.last_name}
          required
        />
        <FormField
          label="Documento"
          name="document_number"
          value={form.document_number}
          onChange={handleChange}
          error={errors.document_number}
          required
        />
        <FormField
          label="Grado"
          name="grade"
          value={form.grade}
          onChange={handleChange}
          error={errors.grade}
          required
        />
        <FormField
          label="Anio academico"
          name="academic_year"
          value={form.academic_year}
          onChange={handleChange}
          error={errors.academic_year}
          required
        />
        <FormField
          as="select"
          label="Estado de matricula"
          name="enrollment_status"
          value={form.enrollment_status}
          onChange={handleChange}
          options={statusOptions}
          error={errors.enrollment_status}
          required
        />

        <div className="form-actions">
          <Link className="button secondary" to="/academic/students">
            Cancelar
          </Link>
          <button className="button primary" disabled={isSubmitting} type="submit">
            {isSubmitting ? "Guardando..." : "Guardar estudiante"}
          </button>
        </div>
      </form>
    </div>
  );
}
