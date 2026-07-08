# CampusConnect 360

CampusConnect 360 es un ecosistema de integracion para una red de colegios. En la Fase 1 el proyecto contiene solamente infraestructura base y microservicios minimos de salud tecnica.

No incluye frontend, CRUD, autenticacion, productores, consumidores ni logica de negocio.

## Arquitectura

La arquitectura de Fase 1 usa:

- Kong en modo DB-less como API Gateway.
- FastAPI para los servicios base.
- PostgreSQL independiente por servicio.
- RabbitMQ Management preparado con definiciones declarativas.
- Docker Compose como orquestador local.
- Contratos JSON Schema para eventos documentados, sin implementacion de eventos.

## Servicios

| Componente | Puerto host | Puerto interno | Descripcion |
|---|---:|---:|---|
| Kong Proxy | 8000 | 8000 | Entrada HTTP del API Gateway |
| Kong Admin | 8001 | 8001 | API administrativa local de Kong |
| RabbitMQ AMQP | 5672 | 5672 | Broker AMQP |
| RabbitMQ Management | 15672 | 15672 | Consola web de RabbitMQ |
| academic-service | 3001 | 3001 | Servicio FastAPI base |
| payments-service | 3002 | 3002 | Servicio FastAPI base |
| wellbeing-service | 3003 | 3003 | Servicio FastAPI base |
| academic-db | 5433 | 5432 | PostgreSQL de academic-service |
| payments-db | 5434 | 5432 | PostgreSQL de payments-service |
| wellbeing-db | 5435 | 5432 | PostgreSQL de wellbeing-service |

## Rutas Gateway

Kong carga `infrastructure/gateway/kong.yml` en modo DB-less:

- `/academic` -> `academic-service:3001`
- `/payments` -> `payments-service:3002`
- `/wellbeing` -> `wellbeing-service:3003`

## Levantar Docker

```powershell
docker compose up -d --build
```

## Verificar infraestructura

```powershell
docker compose ps
docker compose config
```

Verificar servicios:

```powershell
curl http://localhost:3001/health
curl http://localhost:3002/health
curl http://localhost:3003/health
```

Verificar Kong:

```powershell
curl http://localhost:8000/academic/health
curl http://localhost:8000/payments/health
curl http://localhost:8000/wellbeing/health
```

Verificar RabbitMQ Management:

- URL: `http://localhost:15672`
- Usuario: `campusconnect`
- Password: `campusconnect`

## Contratos

Los contratos JSON Schema estan en `contracts/events`. En Fase 1 son documentales y no implican productores ni consumidores.
