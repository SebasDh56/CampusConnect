// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

const api = vi.hoisted(() => ({ getStudents: vi.fn() }));

vi.mock("../api/academicApi", () => api);

import { StudentSelector } from "./StudentSelector";

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("StudentSelector", () => {
  it("lists registered students and returns the selected student", async () => {
    const student = {
      student_id: "student-1",
      school_id: "school-1",
      first_name: "Mateo",
      last_name: "Rivera",
      document_number: "DOC-1",
      grade: "8vo EGB",
      academic_year: "2026",
      enrollment_status: "ENROLLED",
      financial_status: "PENDING",
      last_confirmed_payment_id: null,
      financial_status_updated_at: null,
      created_at: "2026-07-16T10:00:00Z",
      updated_at: "2026-07-16T10:00:00Z",
    };
    const onSelect = vi.fn();
    api.getStudents.mockResolvedValue([student]);

    render(<StudentSelector value="" onSelect={onSelect} />);

    const option = await screen.findByRole("option", { name: "Mateo Rivera - DOC-1 (8vo EGB)" });
    expect(option).toBeTruthy();

    fireEvent.change(screen.getByRole("combobox", { name: "Estudiante" }), {
      target: { value: "student-1" },
    });

    expect(onSelect).toHaveBeenCalledWith(student);
  });

  it("shows a useful error when Academic Service cannot be queried", async () => {
    api.getStudents.mockRejectedValue(new Error("offline"));

    render(<StudentSelector value="" onSelect={vi.fn()} />);

    expect(await screen.findByText("No se pudieron consultar los estudiantes.")).toBeTruthy();
  });
});
