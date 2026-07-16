import { beforeEach, describe, expect, it, vi } from "vitest";

const clients = vi.hoisted(() => ({
  gatewayGet: vi.fn(),
  notificationsGet: vi.fn(),
  analyticsGet: vi.fn(),
}));

vi.mock("./http", () => ({
  gatewayHttp: { get: clients.gatewayGet },
  notificationsHttp: { get: clients.notificationsGet },
  analyticsHttp: { get: clients.analyticsGet },
}));

import {
  getAnalyticsEvents,
  getAnalyticsProcessedEvents,
  getNotifications,
  getNotificationsProcessedEvents,
} from "./supportApi";

describe("support API gateway routing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clients.gatewayGet.mockResolvedValue({ data: [] });
    clients.notificationsGet.mockResolvedValue({ data: [] });
    clients.analyticsGet.mockResolvedValue({ data: [] });
  });

  it("routes notifications through Kong", async () => {
    await getNotifications();
    await getNotificationsProcessedEvents();

    expect(clients.gatewayGet).toHaveBeenNthCalledWith(1, "/notifications/notifications");
    expect(clients.gatewayGet).toHaveBeenNthCalledWith(2, "/notifications/processed-events");
    expect(clients.notificationsGet).not.toHaveBeenCalled();
  });

  it("routes analytics through Kong", async () => {
    await getAnalyticsEvents();
    await getAnalyticsProcessedEvents();

    expect(clients.gatewayGet).toHaveBeenNthCalledWith(1, "/analytics/analytics-events");
    expect(clients.gatewayGet).toHaveBeenNthCalledWith(2, "/analytics/processed-events");
    expect(clients.analyticsGet).not.toHaveBeenCalled();
  });
});
