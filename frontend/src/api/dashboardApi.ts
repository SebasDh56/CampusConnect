import { getStudents } from "./academicApi";
import { getPayments } from "./paymentsApi";
import {
  getAnalyticsEvents,
  getAnalyticsProcessedEvents,
  getNotifications,
} from "./supportApi";
import { getAttendance, getIncidents } from "./wellbeingApi";
import type { Student } from "../types/academic";
import type { DashboardData, EcosystemStatus, ServiceAvailability, ServiceKey } from "../types/dashboard";
import type { Payment } from "../types/payments";
import type { AnalyticsEvent, Notification, ProcessedEvent } from "../types/support";
import type { Attendance, Incident } from "../types/wellbeing";

type SourceResult<T> = {
  service: ServiceKey;
  fallback: T;
  result: PromiseSettledResult<T>;
};

function valueOrFallback<T>({ fallback, result }: SourceResult<T>): T {
  return result.status === "fulfilled" ? result.value : fallback;
}

function errorMessage(result: PromiseSettledResult<unknown>): string | undefined {
  if (result.status === "fulfilled") {
    return undefined;
  }

  return result.reason instanceof Error ? result.reason.message : "Consulta no disponible.";
}

function ecosystemStatus(availability: ServiceAvailability[]): EcosystemStatus {
  const availableCount = availability.filter((service) => service.available).length;

  if (availableCount === availability.length) {
    return "OPERATIVO";
  }

  if (availableCount > 0) {
    return "PARCIAL";
  }

  return "NO DISPONIBLE";
}

export async function getDashboardData(): Promise<DashboardData> {
  const [
    studentsResult,
    paymentsResult,
    attendanceResult,
    incidentsResult,
    notificationsResult,
    analyticsEventsResult,
    analyticsProcessedEventsResult,
  ] = await Promise.allSettled([
    getStudents(),
    getPayments(),
    getAttendance(),
    getIncidents(),
    getNotifications(),
    getAnalyticsEvents(),
    getAnalyticsProcessedEvents(),
  ]);

  const students = valueOrFallback<Student[]>({
    service: "academic",
    fallback: [],
    result: studentsResult,
  });
  const payments = valueOrFallback<Payment[]>({
    service: "payments",
    fallback: [],
    result: paymentsResult,
  });
  const attendance = valueOrFallback<Attendance[]>({
    service: "wellbeing",
    fallback: [],
    result: attendanceResult,
  });
  const incidents = valueOrFallback<Incident[]>({
    service: "wellbeing",
    fallback: [],
    result: incidentsResult,
  });
  const notifications = valueOrFallback<Notification[]>({
    service: "notifications",
    fallback: [],
    result: notificationsResult,
  });
  const analyticsEvents = valueOrFallback<AnalyticsEvent[]>({
    service: "analytics",
    fallback: [],
    result: analyticsEventsResult,
  });
  const analyticsProcessedEvents = valueOrFallback<ProcessedEvent[]>({
    service: "analytics",
    fallback: [],
    result: analyticsProcessedEventsResult,
  });

  const serviceAvailability: ServiceAvailability[] = [
    {
      key: "academic",
      label: "Academic Service",
      available: studentsResult.status === "fulfilled",
    },
    {
      key: "payments",
      label: "Payments Service",
      available: paymentsResult.status === "fulfilled",
    },
    {
      key: "wellbeing",
      label: "Wellbeing Service",
      available: attendanceResult.status === "fulfilled" && incidentsResult.status === "fulfilled",
    },
    {
      key: "notifications",
      label: "Notifications Service",
      available: notificationsResult.status === "fulfilled",
    },
    {
      key: "analytics",
      label: "Analytics Service",
      available:
        analyticsEventsResult.status === "fulfilled" &&
        analyticsProcessedEventsResult.status === "fulfilled",
    },
  ];

  return {
    students,
    payments,
    attendance,
    incidents,
    notifications,
    analyticsEvents,
    analyticsProcessedEvents,
    serviceAvailability,
    ecosystemStatus: ecosystemStatus(serviceAvailability),
    errors: {
      academic: errorMessage(studentsResult),
      payments: errorMessage(paymentsResult),
      wellbeing: errorMessage(attendanceResult) ?? errorMessage(incidentsResult),
      notifications: errorMessage(notificationsResult),
      analytics: errorMessage(analyticsEventsResult) ?? errorMessage(analyticsProcessedEventsResult),
    },
  };
}
