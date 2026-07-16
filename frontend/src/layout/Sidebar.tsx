import { NavLink } from "react-router-dom";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  isActive ? "sidebar-link active" : "sidebar-link";

export function Sidebar() {
  return (
    <aside className="sidebar">
      <h1 className="sidebar-title">CampusConnect 360</h1>

      <p className="sidebar-section">General</p>
      <NavLink className={linkClass} to="/dashboard">
        Dashboard
      </NavLink>

      <p className="sidebar-section">Académico</p>
      <NavLink className={linkClass} to="/academic/students">
        Estudiantes
      </NavLink>
      <NavLink className={linkClass} to="/academic/students/new">
        Registrar estudiante
      </NavLink>

      <p className="sidebar-section">Financiero</p>
      <NavLink className={linkClass} to="/payments">
        Pagos
      </NavLink>
      <NavLink className={linkClass} to="/payments/new">
        Registrar pago
      </NavLink>

      <p className="sidebar-section">Bienestar</p>
      <NavLink className={linkClass} to="/wellbeing/attendance">
        Asistencias
      </NavLink>
      <NavLink className={linkClass} to="/wellbeing/incidents">
        Incidentes
      </NavLink>

      <p className="sidebar-section">Soporte</p>
      <NavLink className={linkClass} to="/support/notifications">
        Notificaciones
      </NavLink>
      <NavLink className={linkClass} to="/support/analytics-events">
        Eventos analíticos
      </NavLink>
    </aside>
  );
}
