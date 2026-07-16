# Catalogo de eventos implementados

Todos los eventos se publican en `campusconnect.events`, usan JSON y contienen
`eventId`, `eventType`, `occurredAt`, `correlationId` y `data`.

| Evento | Routing key | Productor | Consumidores |
|---|---|---|---|
| StudentEnrolled | `student.enrolled` | Academic | Notifications, Analytics |
| PaymentConfirmed | `payment.confirmed` | Payments | Academic, Notifications, Analytics |
| AttendanceRecorded | `attendance.recorded` | Wellbeing | Analytics |
| IncidentReported | `incident.reported` | Wellbeing | Notifications, Analytics |

## StudentEnrolled

Se genera al crear una matricula. `data` contiene estudiante, colegio, grado,
periodo academico y estado de matricula. Contrato:
`contracts/events/student-enrolled.schema.json`.

## PaymentConfirmed

Se genera al crear o actualizar un pago hacia `PAID` o `CONFIRMED`. Academic
traduce el evento a una actualizacion de estado financiero. Contrato:
`contracts/events/payment-confirmed.schema.json`.

## AttendanceRecorded

Se genera al registrar asistencia, ausencia, atraso o ausencia justificada.
Contrato: `contracts/events/attendance-recorded.schema.json`.

## IncidentReported

Se genera al registrar una novedad. Notifications crea la alerta simulada y
Analytics actualiza su proyeccion. Contrato:
`contracts/events/incident-reported.schema.json`.

## Entrega, errores e idempotencia

RabbitMQ entrega copias a colas por consumidor. Un consumidor confirma el
mensaje solo despues de persistir sus efectos. `processed_events.event_id`
impide reprocesar duplicados. Los rechazos sin requeue llegan a
`campusconnect.dead-letter.queue`.
