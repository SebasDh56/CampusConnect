import { getStudents } from "./academicApi";
import { getPayments } from "./paymentsApi";
import {
  getAnalyticsEvents,
  getAnalyticsProcessedEvents,
  getNotifications,
  getNotificationsProcessedEvents,
} from "./supportApi";
import { getAttendance, getIncidents } from "./wellbeingApi";
import type { Student } from "../types/academic";
import type { DashboardData, EcosystemStatus, ServiceAvailability, ServiceKey } from "../types/dashboard";
import type { Payment } from "../types/payments";
import type { AnalyticsEvent, Notification, ProcessedEvent } from "../types/support";
import type { Attendance, Incident } from "../types/wellbeing";

type SourceResult<T> = {
  fallback: T;
  result: PromiseSettledResult<T>;
};

type ServiceDefinition = {
  key: ServiceKey;
  label: string;
  results: PromiseSettledResult<unknown>[];
};

function valueOrFallback<T>({ fallback, result }: SourceResult<T>): T {
  return result.status === "fulfilled" ? result.value : fallback;
}

function isAvailable(results: PromiseSettledResult<unknown>[]): boolean {
  return results.every((result) => result.status === "fulfilled");
}

function errorMessage(result: PromiseSettledResult<unknown>): string | undefined {
  if (result.status === "fulfilled") {
    return undefined;
  }

  return result.reason instanceof Error ? result.reason.message : "Consulta no disponible.";
}

function firstError(results: PromiseSettledResult<unknown>[]): string | undefined {
  for (const result of results) {
    const message = errorMessage(result);

    if (message) {
      return message;
    }
  }

  return undefined;
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
    notificationsProcessedEventsResult,
  ] = await Promise.allSettled([
    getStudents(),
    getPayments(),
    getAttendance(),
    getIncidents(),
    getNotifications(),
    getAnalyticsEvents(),
    getAnalyticsProcessedEvents(),
    getNotificationsProcessedEvents(),
  ]);

  const students = valueOrFallback<Student[]>({
    fallback: [],
    result: studentsResult,
  });
  const payments = valueOrFallback<Payment[]>({
    fallback: [],
    result: paymentsResult,
  });
  const attendance = valueOrFallback<Attendance[]>({
    fallback: [],
    result: attendanceResult,
  });
  const incidents = valueOrFallback<Incident[]>({
    fallback: [],
    result: incidentsResult,
  });
  const notifications = valueOrFallback<Notification[]>({
    fallback: [],
    result: notificationsResult,
  });
  const analyticsEvents = valueOrFallback<AnalyticsEvent[]>({
    fallback: [],
    result: analyticsEventsResult,
  });
  const analyticsProcessedEvents = valueOrFallback<ProcessedEvent[]>({
    fallback: [],
    result: analyticsProcessedEventsResult,
  });
  const notificationsProcessedEvents = valueOrFallback<ProcessedEvent[]>({
    fallback: [],
    result: notificationsProcessedEventsResult,
  });

  const services: ServiceDefinition[] = [
    {
      key: "academic",
      label: "Academic Service",
      results: [studentsResult],
    },
    {
      key: "payments",
      label: "Payments Service",
      results: [paymentsResult],
    },
    {
      key: "wellbeing",
      label: "Wellbeing Service",
      results: [attendanceResult, incidentsResult],
    },
    {
      key: "notifications",
      label: "Notifications Service",
      results: [notificationsResult, notificationsProcessedEventsResult],
    },
    {
      key: "analytics",
      label: "Analytics Service",
      results: [analyticsEventsResult, analyticsProcessedEventsResult],
    },
  ];

  const serviceAvailability: ServiceAvailability[] = services.map(({ key, label, results }) => ({
    key,
    label,
    available: isAvailable(results),
  }));

  const errors = Object.fromEntries(
    services
      .map(({ key, results }) => {
        const message = firstError(results);
        return message ? [key, message] : undefined;
      })
      .filter((entry): entry is [ServiceKey, string] => entry !== undefined),
  ) as Partial<Record<ServiceKey, string>>;

  return {
    students,
    payments,
    attendance,
    incidents,
    notifications,
    analyticsEvents,
    analyticsProcessedEvents,
    notificationsProcessedEvents,
    serviceAvailability,
    ecosystemStatus: ecosystemStatus(serviceAvailability),
    errors,
  };
}
