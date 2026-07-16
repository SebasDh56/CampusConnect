# ADR-001 - Arquitectura de integracion local

## Estado

Aceptada e implementada.

## Contexto

CampusConnect 360 necesita integrar dominios independientes, permitir una demo
local reproducible y evidenciar APIs, mensajeria, seguridad, resiliencia,
trazabilidad y una vista analitica.

## Decision

Se adopta React para la interfaz, FastAPI para los cinco servicios, PostgreSQL
con una base por servicio, RabbitMQ con exchange topic, Kong DB-less como API
Gateway y Docker Compose para orquestacion local.

Los productores publican eventos de negocio y los consumidores usan colas
propias. Esta separacion implementa Publish/Subscribe sin convertir a los
consumidores en competidores. El flujo PaymentConfirmed hacia Academic usa una
cola dedicada punto a punto.

Kong aplica API Key y CORS a todas las APIs usadas por el frontend. Analytics
mantiene una proyeccion CQRS para el dashboard. Cada consumidor aplica
idempotencia por `eventId` y envia rechazos a una Dead Letter Queue comun.

## Alternativas descartadas

- Un monolito reducia infraestructura, pero no evidenciaba limites de dominio ni
  patrones de integracion.
- Kafka agregaba complejidad operativa innecesaria para el volumen de la demo.
- Llamadas sincronas entre todos los servicios aumentaban acoplamiento y no
  permitian demostrar resiliencia asincrona.
- Un dashboard externo agregaba otra herramienta; React reutiliza el portal y
  consume la proyeccion real.

## Consecuencias

- El entorno completo se levanta con un comando.
- Cada dominio mantiene su persistencia.
- Los eventos pueden procesarse de forma eventual e idempotente.
- La DLQ hace visible una falla controlada.
- La API Key local no debe confundirse con seguridad de produccion.
- Sin Transactional Outbox existe una ventana de inconsistencia entre commit y
  publicacion; se registra como limitacion conocida.
