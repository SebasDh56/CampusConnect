import { analyticsHttp, notificationsHttp } from "./http";
import type { AnalyticsEvent, Notification, ProcessedEvent } from "../types/support";

export async function getAnalyticsEvents(): Promise<AnalyticsEvent[]> {
  const response = await analyticsHttp.get<AnalyticsEvent[]>("/analytics-events");
  return response.data;
}

export async function getNotifications(): Promise<Notification[]> {
  const response = await notificationsHttp.get<Notification[]>("/notifications");
  return response.data;
}

export async function getAnalyticsProcessedEvents(): Promise<ProcessedEvent[]> {
  const response = await analyticsHttp.get<ProcessedEvent[]>("/processed-events");
  return response.data;
}

export async function getNotificationsProcessedEvents(): Promise<ProcessedEvent[]> {
  const response = await notificationsHttp.get<ProcessedEvent[]>("/processed-events");
  return response.data;
}
