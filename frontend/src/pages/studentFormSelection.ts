import type { Student } from "../types/academic";

export function paymentStudentFields(student: Student | null) {
  return {
    student_id: student?.student_id ?? "",
    school_id: student?.school_id ?? "",
  };
}

export function attendanceStudentFields(student: Student | null) {
  return {
    ...paymentStudentFields(student),
    grade: student?.grade ?? "",
  };
}

export const incidentStudentFields = paymentStudentFields;
