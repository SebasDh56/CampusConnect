# Fase 1 - Infraestructura

Esta fase define la base tecnica de CampusConnect 360 sin avanzar a logica de negocio, CRUD, autenticacion, frontend o mensajeria implementada.

## API Gateway

Kong funciona en modo DB-less con `KONG_DATABASE=off`. La configuracion declarativa se monta desde `infrastructure/gateway/kong.yml` y se carga mediante `KONG_DECLARATIVE_CONFIG=/kong/declarative/kong.yml`.

Rutas configuradas:

- `/academic` hacia `academic-service:3001`
- `/payments` hacia `payments-service:3002`
- `/wellbeing` hacia `wellbeing-service:3003`

## RabbitMQ

RabbitMQ usa la imagen `rabbitmq:3.13-management`, exponiendo:

- `5672` para AMQP
- `15672` para Management UI

El archivo `infrastructure/rabbitmq/definitions.json` se monta en el contenedor y se carga con `management.load_definitions`. Esto deja declarados exchange, bindings, colas y dead letter queue para la infraestructura, sin implementar productores ni consumidores.

## PostgreSQL

Cada servicio tiene su propia base de datos PostgreSQL:

- `academic_db`
- `payments_db`
- `wellbeing_db`

Cada base usa un volumen persistente independiente. Los archivos `init.sql` se montan en `/docker-entrypoint-initdb.d/init.sql`. En esta fase permanecen vacios porque no se crean tablas ni modelos.

## FastAPI

Los servicios FastAPI son esqueletos tecnicos con un unico endpoint `GET /health`:

- `academic-service` en puerto `3001`
- `payments-service` en puerto `3002`
- `wellbeing-service` en puerto `3003`

Cada servicio contiene configuracion por variables de entorno y una base de conexion SQLAlchemy, sin CRUD ni logica de negocio.

## Docker Compose

Docker Compose define la red `campusconnect-network`, volumenes persistentes, healthchecks, politicas de reinicio y dependencias de arranque basadas en salud de PostgreSQL.

Los healthchecks HTTP usan peticiones GET reales para evitar respuestas `405 Method Not Allowed` causadas por `HEAD /health`.
