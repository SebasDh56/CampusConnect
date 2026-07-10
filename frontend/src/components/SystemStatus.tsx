import type { EcosystemStatus, ServiceAvailability } from "../types/dashboard";

type SystemStatusProps = {
  status: EcosystemStatus;
  services: ServiceAvailability[];
};

export function SystemStatus({ status, services }: SystemStatusProps) {
  return (
    <article className="dashboard-card">
      <div className="card-title-row">
        <h3>Estado del ecosistema</h3>
        <span className={`system-pill ${status.toLowerCase().replace(" ", "-")}`}>{status}</span>
      </div>
      <div className="service-status-list">
        {services.map((service) => (
          <div className="service-status-row" key={service.key}>
            <span>{service.label}</span>
            <strong className={service.available ? "available" : "unavailable"}>
              {service.available ? "Disponible" : "No disponible"}
            </strong>
          </div>
        ))}
      </div>
    </article>
  );
}
