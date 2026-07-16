import { describe, expect, it } from "vitest";

import type { Student } from "../types/academic";
import {
  attendanceStudentFields,
  incidentStudentFields,
  paymentStudentFields,
} from "./studentFormSelection";

const student: Student = {
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

describe("student form selection", () => {
  it("fills payment and incident identifiers from the selected student", () => {
    expect(paymentStudentFields(student)).toEqual({ student_id: "student-1", school_id: "school-1" });
    expect(incidentStudentFields(student)).toEqual({ student_id: "student-1", school_id: "school-1" });
  });

  it("also fills the grade required by attendance", () => {
    expect(attendanceStudentFields(student)).toEqual({
      student_id: "student-1",
      school_id: "school-1",
      grade: "8vo EGB",
    });
  });

  it("clears dependent fields when the selection is removed", () => {
    expect(paymentStudentFields(null)).toEqual({ student_id: "", school_id: "" });
    expect(attendanceStudentFields(null)).toEqual({ student_id: "", school_id: "", grade: "" });
  });
});
