# Catalogo de Eventos

Este catalogo documenta contratos previstos para CampusConnect 360. En Fase 1 no existen productores, consumidores ni publicacion de eventos.

Todos los contratos base incluyen:

- `eventId`
- `eventType`
- `occurredAt`
- `correlationId`
- `additionalProperties: false`

## StudentEnrolled

Contrato: `contracts/events/student-enrolled.schema.json`

Routing key prevista: `student.enrolled`

Descripcion: representa la inscripcion de un estudiante. Solo esta documentado como contrato base; no esta implementado.

## PaymentConfirmed

Contrato: `contracts/events/payment-confirmed.schema.json`

Routing key prevista: `payment.confirmed`

Descripcion: representa la confirmacion de un pago. Solo esta documentado como contrato base; no esta implementado.

## AttendanceRecorded

Contrato: `contracts/events/attendance-recorded.schema.json`

Routing key prevista: `attendance.recorded`

Descripcion: representa el registro de asistencia. Solo esta documentado como contrato base; no esta implementado.

## IncidentReported

Contrato: `contracts/events/incident-reported.schema.json`

Routing key prevista: `incident.reported`

Descripcion: representa el reporte de un incidente. Solo esta documentado como contrato base; no esta implementado.
