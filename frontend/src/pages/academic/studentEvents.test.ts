import { describe, expect, it } from "vitest";

import type { AnalyticsEvent } from "../../types/support";
import { getStudentEvents } from "./studentEvents";

function event(eventId: string, studentId: unknown, occurredAt: string): AnalyticsEvent {
  return {
    analytics_event_id: `analytics-${eventId}`,
    event_id: eventId,
    event_type: "StudentEnrolled",
    correlation_id: `corr-${eventId}`,
    routing_key: "student.enrolled",
    occurred_at: occurredAt,
    payload: { data: { studentId } },
    processed_at: occurredAt,
  };
}

describe("getStudentEvents", () => {
  it("returns only the events associated with the requested student, newest first", () => {
    const events = [
      event("old", "student-1", "2026-07-15T10:00:00Z"),
      event("other", "student-2", "2026-07-16T10:00:00Z"),
      event("new", "student-1", "2026-07-17T10:00:00Z"),
    ];

    expect(getStudentEvents(events, "student-1").map((item) => item.event_id)).toEqual(["new", "old"]);
  });

  it("ignores events whose payload does not contain a valid studentId", () => {
    const invalid = event("invalid", 123, "2026-07-15T10:00:00Z");
    invalid.payload = { data: "invalid" };

    expect(getStudentEvents([invalid], "student-1")).toEqual([]);
  });
});
