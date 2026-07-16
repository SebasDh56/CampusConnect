import type { DashboardData, DashboardMetrics } from "../../types/dashboard";

const confirmedPaymentStatuses = new Set(["PAID", "CONFIRMED"]);

export function calculateDashboardMetrics(data: DashboardData): DashboardMetrics {
  const failedEventIds = new Set(
    [...data.analyticsProcessedEvents, ...data.notificationsProcessedEvents]
      .filter((event) => event.status === "FAILED")
      .map((event) => event.event_id),
  );

  return {
    totalStudents: data.students.length,
    confirmedPayments: data.payments.filter((payment) =>
      confirmedPaymentStatuses.has(payment.payment_status),
    ).length,
    pendingPayments: data.payments.filter((payment) => payment.payment_status === "PENDING").length,
    attendanceCount: data.attendance.length,
    incidentsCount: data.incidents.length,
    processedEvents: data.analyticsProcessedEvents.filter((event) => event.status === "PROCESSED").length,
    failedMessages: failedEventIds.size,
    notificationsCount: data.notifications.length,
  };
}
