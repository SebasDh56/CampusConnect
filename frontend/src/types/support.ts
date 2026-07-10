export type AnalyticsEvent = {
  analytics_event_id: string;
  event_id: string;
  event_type: string;
  correlation_id: string | null;
  routing_key: string;
  occurred_at: string | null;
  payload: Record<string, unknown>;
  processed_at: string;
};

export type Notification = {
  notification_id: string;
  event_id: string;
  event_type: string;
  correlation_id: string | null;
  recipient_type: string;
  recipient_reference: string | null;
  title: string;
  message: string;
  status: string;
  created_at: string;
};

export type ProcessedEvent = {
  event_id: string;
  event_type: string;
  correlation_id: string | null;
  routing_key: string;
  status: string;
  attempts: number;
  processed_at: string | null;
  failed_at: string | null;
  last_error: string | null;
};
