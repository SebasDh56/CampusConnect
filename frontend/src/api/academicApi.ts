import { gatewayHttp } from "./http";
import type { Student, StudentCreate } from "../types/academic";

export async function getStudents(): Promise<Student[]> {
  const response = await gatewayHttp.get<Student[]>("/academic/students");
  return response.data;
}

export async function getStudentById(studentId: string): Promise<Student> {
  const response = await gatewayHttp.get<Student>(`/academic/students/${studentId}`);
  return response.data;
}

export async function createStudent(payload: StudentCreate): Promise<Student> {
  const response = await gatewayHttp.post<Student>("/academic/students", payload);
  return response.data;
}
