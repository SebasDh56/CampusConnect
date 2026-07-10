import { createBrowserRouter, Navigate } from "react-router-dom";

import { App } from "./App";
import { StudentCreatePage } from "./pages/academic/StudentCreatePage";
import { StudentDetailPage } from "./pages/academic/StudentDetailPage";
import { StudentsListPage } from "./pages/academic/StudentsListPage";
import { PaymentConfirmPage } from "./pages/payments/PaymentConfirmPage";
import { PaymentCreatePage } from "./pages/payments/PaymentCreatePage";
import { PaymentsListPage } from "./pages/payments/PaymentsListPage";
import { AnalyticsEventsPage } from "./pages/support/AnalyticsEventsPage";
import { NotificationsPage } from "./pages/support/NotificationsPage";
import { AttendanceCreatePage } from "./pages/wellbeing/AttendanceCreatePage";
import { AttendanceListPage } from "./pages/wellbeing/AttendanceListPage";
import { IncidentCreatePage } from "./pages/wellbeing/IncidentCreatePage";
import { IncidentsListPage } from "./pages/wellbeing/IncidentsListPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Navigate to="/academic/students" replace /> },
      { path: "academic/students", element: <StudentsListPage /> },
      { path: "academic/students/new", element: <StudentCreatePage /> },
      { path: "academic/students/:studentId", element: <StudentDetailPage /> },
      { path: "payments", element: <PaymentsListPage /> },
      { path: "payments/new", element: <PaymentCreatePage /> },
      { path: "payments/:paymentId/confirm", element: <PaymentConfirmPage /> },
      { path: "wellbeing/attendance", element: <AttendanceListPage /> },
      { path: "wellbeing/attendance/new", element: <AttendanceCreatePage /> },
      { path: "wellbeing/incidents", element: <IncidentsListPage /> },
      { path: "wellbeing/incidents/new", element: <IncidentCreatePage /> },
      { path: "support/notifications", element: <NotificationsPage /> },
      { path: "support/analytics-events", element: <AnalyticsEventsPage /> },
    ],
  },
]);
