import type { AnalyticsEvent } from "../../types/support";

function eventStudentId(event: AnalyticsEvent): string | null {
  const data = event.payload.data;
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return null;
  }

  const studentId = (data as Record<string, unknown>).studentId;
  return typeof studentId === "string" ? studentId : null;
}

export function getStudentEvents(events: AnalyticsEvent[], studentId: string): AnalyticsEvent[] {
  return events
    .filter((event) => eventStudentId(event) === studentId)
    .sort((left, right) => {
      const leftDate = left.occurred_at ?? left.processed_at;
      const rightDate = right.occurred_at ?? right.processed_at;
      return new Date(rightDate).getTime() - new Date(leftDate).getTime();
    });
}
