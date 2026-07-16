// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

const api = vi.hoisted(() => ({
  getNotifications: vi.fn(),
  getAnalyticsEvents: vi.fn(),
}));

vi.mock("../../api/supportApi", () => api);

import { AnalyticsEventsPage } from "./AnalyticsEventsPage";
import { NotificationsPage } from "./NotificationsPage";

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("support pages", () => {
  it("renders notifications returned by the service", async () => {
    api.getNotifications.mockResolvedValue([
      {
        notification_id: "notification-1",
        event_id: "event-1",
        event_type: "StudentEnrolled",
        correlation_id: "corr-1",
        recipient_type: "REPRESENTATIVE",
        recipient_reference: "student-1",
        title: "Matricula registrada",
        message: "El estudiante fue matriculado.",
        status: "SENT",
        created_at: "2026-07-15T10:00:00Z",
      },
    ]);

    render(<NotificationsPage />);

    expect(await screen.findByText("Matricula registrada")).toBeTruthy();
    expect(screen.getByText("StudentEnrolled")).toBeTruthy();
  });

  it("renders analytics events returned by the service", async () => {
    api.getAnalyticsEvents.mockResolvedValue([
      {
        analytics_event_id: "analytics-1",
        event_id: "event-1",
        event_type: "PaymentConfirmed",
        correlation_id: "corr-1",
        routing_key: "payment.confirmed",
        occurred_at: "2026-07-15T10:00:00Z",
        payload: {},
        processed_at: "2026-07-15T10:00:01Z",
      },
    ]);

    render(<AnalyticsEventsPage />);

    expect(await screen.findByText("PaymentConfirmed")).toBeTruthy();
    expect(screen.getByText("payment.confirmed")).toBeTruthy();
  });
});
