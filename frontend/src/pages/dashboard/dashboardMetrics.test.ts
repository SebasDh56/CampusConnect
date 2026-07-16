import { describe, expect, it } from "vitest";

import { calculateDashboardMetrics } from "./dashboardMetrics";

function processed(eventId: string, status: string) {
  return {
    event_id: eventId,
    event_type: "TestEvent",
    correlation_id: null,
    routing_key: "test.event",
    status,
    attempts: 1,
    processed_at: status === "PROCESSED" ? "2026-07-15T10:00:00Z" : null,
    failed_at: status === "FAILED" ? "2026-07-15T10:00:00Z" : null,
    last_error: status === "FAILED" ? "controlled failure" : null,
  };
}

describe("dashboard metrics", () => {
  it("counts successful events separately from unique failed messages", () => {
    const metrics = calculateDashboardMetrics({
      students: [{ student_id: "student-1" }],
      payments: [
        { payment_id: "payment-1", payment_status: "PAID" },
        { payment_id: "payment-2", payment_status: "PENDING" },
      ],
      attendance: [{ attendance_id: "attendance-1" }],
      incidents: [{ incident_id: "incident-1" }],
      notifications: [{ notification_id: "notification-1" }],
      analyticsEvents: [],
      analyticsProcessedEvents: [processed("event-ok", "PROCESSED"), processed("event-failed", "FAILED")],
      notificationsProcessedEvents: [processed("event-failed", "FAILED"), processed("event-failed-2", "FAILED")],
      serviceAvailability: [],
      ecosystemStatus: "OPERATIVO",
      errors: {},
    } as never);

    expect(metrics).toEqual({
      totalStudents: 1,
      confirmedPayments: 1,
      pendingPayments: 1,
      attendanceCount: 1,
      incidentsCount: 1,
      processedEvents: 1,
      failedMessages: 2,
      notificationsCount: 1,
    });
  });
});
