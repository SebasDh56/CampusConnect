import { beforeEach, describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({
  getStudents: vi.fn(),
  getPayments: vi.fn(),
  getAttendance: vi.fn(),
  getIncidents: vi.fn(),
  getNotifications: vi.fn(),
  getAnalyticsEvents: vi.fn(),
  getAnalyticsProcessedEvents: vi.fn(),
  getNotificationsProcessedEvents: vi.fn(),
}));

vi.mock("./academicApi", () => ({
  getStudents: api.getStudents,
}));

vi.mock("./paymentsApi", () => ({
  getPayments: api.getPayments,
}));

vi.mock("./wellbeingApi", () => ({
  getAttendance: api.getAttendance,
  getIncidents: api.getIncidents,
}));

vi.mock("./supportApi", () => ({
  getNotifications: api.getNotifications,
  getAnalyticsEvents: api.getAnalyticsEvents,
  getAnalyticsProcessedEvents: api.getAnalyticsProcessedEvents,
  getNotificationsProcessedEvents: api.getNotificationsProcessedEvents,
}));

import { getDashboardData } from "./dashboardApi";

describe("dashboardApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.getStudents.mockResolvedValue([{ student_id: "student-1" }]);
    api.getPayments.mockResolvedValue([{ payment_id: "payment-1", payment_status: "PAID" }]);
    api.getAttendance.mockResolvedValue([{ attendance_id: "attendance-1" }]);
    api.getIncidents.mockResolvedValue([{ incident_id: "incident-1" }]);
    api.getNotifications.mockResolvedValue([{ notification_id: "notification-1" }]);
    api.getAnalyticsEvents.mockResolvedValue([{ analytics_event_id: "analytics-1", event_type: "LOGIN" }]);
    api.getAnalyticsProcessedEvents.mockResolvedValue([{ event_id: "event-1", status: "PROCESSED" }]);
    api.getNotificationsProcessedEvents.mockResolvedValue([{ event_id: "event-2", status: "PROCESSED" }]);
  });

  it("returns partial status with fallback data and first error per failing service", async () => {
    api.getIncidents.mockRejectedValueOnce(new Error("incidents unavailable"));
    api.getNotifications.mockRejectedValueOnce("gateway down");

    const data = await getDashboardData();

    expect(data.incidents).toEqual([]);
    expect(data.notifications).toEqual([]);
    expect(data.ecosystemStatus).toBe("PARCIAL");
    expect(data.serviceAvailability).toEqual([
      { key: "academic", label: "Academic Service", available: true },
      { key: "payments", label: "Payments Service", available: true },
      { key: "wellbeing", label: "Wellbeing Service", available: false },
      { key: "notifications", label: "Notifications Service", available: false },
      { key: "analytics", label: "Analytics Service", available: true },
    ]);
    expect(data.errors).toEqual({
      wellbeing: "incidents unavailable",
      notifications: "Consulta no disponible.",
    });
  });
});