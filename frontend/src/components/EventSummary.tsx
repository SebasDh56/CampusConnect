import { StatusBadge } from "./StatusBadge";

type EventSummaryProps = {
  counts: Record<string, number>;
};

const eventTypes = ["StudentEnrolled", "PaymentConfirmed", "AttendanceRecorded", "IncidentReported"];

export function EventSummary({ counts }: EventSummaryProps) {
  const maxCount = Math.max(1, ...eventTypes.map((eventType) => counts[eventType] ?? 0));

  return (
    <article className="dashboard-card">
      <h3>Resumen de eventos</h3>
      <div className="event-summary-list">
        {eventTypes.map((eventType) => {
          const count = counts[eventType] ?? 0;
          const width = `${Math.max(6, (count / maxCount) * 100)}%`;

          return (
            <div className="event-summary-row" key={eventType}>
              <div className="event-summary-label">
                <StatusBadge status={eventType} />
                <strong>{count}</strong>
              </div>
              <div className="event-summary-bar" aria-hidden="true">
                <span style={{ width }} />
              </div>
            </div>
          );
        })}
      </div>
    </article>
  );
}
