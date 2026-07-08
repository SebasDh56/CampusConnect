# ADR-001 - Arquitectura base

## Estado

Aceptada para Fase 1.

## Contexto

CampusConnect 360 requiere integrar servicios independientes para una red de colegios. La primera fase debe dejar una base local reproducible, observable y preparada para evolucionar sin introducir aun logica de negocio.

## Decision

Se adopta una arquitectura basada en FastAPI, PostgreSQL, RabbitMQ, Kong DB-less y Docker Compose.

## FastAPI

FastAPI se eligio por su bajo costo operativo, soporte nativo de OpenAPI, tipado con Python y buena ergonomia para servicios HTTP pequenos y medianos.

## PostgreSQL

PostgreSQL se eligio como base relacional principal por su madurez, consistencia transaccional, soporte SQL completo y amplio ecosistema. Cada servicio usa una base independiente para preservar limites de propiedad de datos.

## RabbitMQ

RabbitMQ se eligio como broker AMQP para integraciones asincronas futuras. En Fase 1 solo se deja preparada la infraestructura declarativa; no se implementan productores ni consumidores.

## Kong

Kong se eligio como API Gateway por su soporte de modo DB-less, configuracion declarativa y capacidad de centralizar rutas sin requerir una base de datos adicional.

## Docker Compose

Docker Compose se eligio para orquestacion local porque permite levantar todos los componentes de infraestructura con una configuracion versionable y simple para desarrollo.

## Consecuencias

- La infraestructura local puede levantarse con un unico comando.
- Cada servicio queda aislado con su propia base de datos.
- El gateway y RabbitMQ quedan preparados de forma declarativa.
- Las fases siguientes pueden agregar dominio y mensajeria sin redisenar la base.
