import { gatewayHttp } from "./http";
import type { Attendance, AttendanceCreate, Incident, IncidentCreate } from "../types/wellbeing";

export async function getAttendance(): Promise<Attendance[]> {
  const response = await gatewayHttp.get<Attendance[]>("/wellbeing/attendance");
  return response.data;
}

export async function getAttendanceById(attendanceId: string): Promise<Attendance> {
  const response = await gatewayHttp.get<Attendance>(`/wellbeing/attendance/${attendanceId}`);
  return response.data;
}

export async function createAttendance(payload: AttendanceCreate): Promise<Attendance> {
  const response = await gatewayHttp.post<Attendance>("/wellbeing/attendance", payload);
  return response.data;
}

export async function getIncidents(): Promise<Incident[]> {
  const response = await gatewayHttp.get<Incident[]>("/wellbeing/incidents");
  return response.data;
}

export async function getIncidentById(incidentId: string): Promise<Incident> {
  const response = await gatewayHttp.get<Incident>(`/wellbeing/incidents/${incidentId}`);
  return response.data;
}

export async function createIncident(payload: IncidentCreate): Promise<Incident> {
  const response = await gatewayHttp.post<Incident>("/wellbeing/incidents", payload);
  return response.data;
}
