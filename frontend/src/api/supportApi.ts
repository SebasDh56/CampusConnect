import { gatewayHttp } from "./http";
import type { AnalyticsEvent, Notification, ProcessedEvent } from "../types/support";

export async function getAnalyticsEvents(): Promise<AnalyticsEvent[]> {
  const response = await gatewayHttp.get<AnalyticsEvent[]>("/analytics/analytics-events");
  return response.data;
}

export async function getNotifications(): Promise<Notification[]> {
  const response = await gatewayHttp.get<Notification[]>("/notifications/notifications");
  return response.data;
}

export async function getAnalyticsProcessedEvents(): Promise<ProcessedEvent[]> {
  const response = await gatewayHttp.get<ProcessedEvent[]>("/analytics/processed-events");
  return response.data;
}

export async function getNotificationsProcessedEvents(): Promise<ProcessedEvent[]> {
  const response = await gatewayHttp.get<ProcessedEvent[]>("/notifications/processed-events");
  return response.data;
}
