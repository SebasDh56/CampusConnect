import axios from "axios";
import { type ChangeEvent, type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { createIncident } from "../../api/wellbeingApi";
import { FormField } from "../../components/FormField";
import { PageHeader } from "../../components/PageHeader";
import type { IncidentCreate } from "../../types/wellbeing";

type FormErrors = Partial<Record<keyof IncidentCreate, string>>;

const initialForm: IncidentCreate = {
  student_id: "",
  school_id: "",
  incident_type: "WELLBEING",
  severity: "LOW",
  description: "",
  reported_by: "",
};

const incidentTypeOptions = [
  { label: "ACADEMIC", value: "ACADEMIC" },
  { label: "BEHAVIORAL", value: "BEHAVIORAL" },
  { label: "HEALTH", value: "HEALTH" },
  { label: "WELLBEING", value: "WELLBEING" },
  { label: "OTHER", value: "OTHER" },
];

const severityOptions = [
  { label: "LOW", value: "LOW" },
  { label: "MEDIUM", value: "MEDIUM" },
  { label: "HIGH", value: "HIGH" },
  { label: "CRITICAL", value: "CRITICAL" },
];

export function IncidentCreatePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<IncidentCreate>(initialForm);
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
        nextErrors[key as keyof IncidentCreate] = "Campo requerido.";
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
      await createIncident(form);
      navigate("/wellbeing/incidents");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 422) {
        setSubmitError("El backend rechazo la solicitud. Revisa los campos ingresados.");
        return;
      }

      setSubmitError("No se pudo registrar el incidente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="page-panel">
      <PageHeader
        kicker="Bienestar / Docente"
        title="Registrar incidente"
        description="Reporta un incidente en Wellbeing Service."
      />

      {submitError ? <div className="alert error">{submitError}</div> : null}

      <form className="form-grid" onSubmit={handleSubmit}>
        <FormField
          label="Student ID"
          name="student_id"
          value={form.student_id}
          onChange={handleChange}
          error={errors.student_id}
          required
        />
        <FormField
          label="School ID"
          name="school_id"
          value={form.school_id}
          onChange={handleChange}
          error={errors.school_id}
          required
        />
        <FormField
          as="select"
          label="Tipo de incidente"
          name="incident_type"
          value={form.incident_type}
          onChange={handleChange}
          options={incidentTypeOptions}
          error={errors.incident_type}
          required
        />
        <FormField
          as="select"
          label="Severidad"
          name="severity"
          value={form.severity}
          onChange={handleChange}
          options={severityOptions}
          error={errors.severity}
          required
        />
        <FormField
          label="Descripcion"
          name="description"
          value={form.description}
          onChange={handleChange}
          error={errors.description}
          required
        />
        <FormField
          label="Reportado por"
          name="reported_by"
          value={form.reported_by}
          onChange={handleChange}
          error={errors.reported_by}
          required
        />

        <div className="form-actions">
          <Link className="button secondary" to="/wellbeing/incidents">
            Cancelar
          </Link>
          <button className="button primary" disabled={isSubmitting} type="submit">
            {isSubmitting ? "Guardando..." : "Guardar incidente"}
          </button>
        </div>
      </form>
    </div>
  );
}
