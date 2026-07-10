import type { Student } from "./academic";
import type { Payment } from "./payments";
import type { AnalyticsEvent, Notification, ProcessedEvent } from "./support";
import type { Attendance, Incident } from "./wellbeing";

export type ServiceKey =
  | "academic"
  | "payments"
  | "wellbeing"
  | "notifications"
  | "analytics";

export type ServiceAvailability = {
  key: ServiceKey;
  label: string;
  available: boolean;
};

export type EcosystemStatus = "OPERATIVO" | "PARCIAL" | "NO DISPONIBLE";

export type DashboardData = {
  students: Student[];
  payments: Payment[];
  attendance: Attendance[];
  incidents: Incident[];
  notifications: Notification[];
  analyticsEvents: AnalyticsEvent[];
  analyticsProcessedEvents: ProcessedEvent[];
  serviceAvailability: ServiceAvailability[];
  ecosystemStatus: EcosystemStatus;
  errors: Partial<Record<ServiceKey, string>>;
};

export type DashboardMetrics = {
  totalStudents: number;
  confirmedPayments: number;
  pendingPayments: number;
  attendanceCount: number;
  incidentsCount: number;
  processedEvents: number;
  notificationsCount: number;
};
