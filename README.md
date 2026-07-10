# CampusConnect 360

CampusConnect 360 es un ecosistema local de integracion para una red de colegios. Esta version esta preparada para ejecutarse con Docker Compose e incluye frontend, API Gateway, microservicios, bases PostgreSQL independientes y RabbitMQ.

## Prerrequisitos

- Git.
- Docker Desktop o Docker Engine con Docker Compose v2.

Node.js solo es necesario si quieres ejecutar o validar el frontend fuera de Docker.

## Instalacion rapida

```powershell
git clone <repositorio>
cd CampusConnect
cp .env.example .env
docker compose up --build
```

Cuando los contenedores esten healthy, abre:

- Frontend: `http://localhost:5173`
- Dashboard: `http://localhost:5173/dashboard`
- Kong Gateway: `http://localhost:8000`
- Kong Admin: `http://localhost:8001`
- RabbitMQ Management: `http://localhost:15672`

## API Key de desarrollo

Las rutas de negocio expuestas por Kong requieren API Key mediante el header `apikey`.

Para desarrollo local, `.env.example` usa:

```powershell
VITE_API_KEY=campusconnect-dev-api-key
```

Esta clave es solo de desarrollo local y coincide con el consumer declarado en `infrastructure/gateway/kong.yml`.

Ejemplos:

```powershell
curl http://localhost:8000/academic/students
curl -H "apikey: campusconnect-dev-api-key" http://localhost:8000/academic/students
```

La primera solicitud debe responder `401`. La segunda debe llegar al servicio.

## URLs de servicios

| Componente | URL |
|---|---|
| Frontend | `http://localhost:5173` |
| Kong Gateway | `http://localhost:8000` |
| Kong Admin | `http://localhost:8001` |
| Academic Service | `http://localhost:3001` |
| Payments Service | `http://localhost:3002` |
| Wellbeing Service | `http://localhost:3003` |
| Notifications Service | `http://localhost:3004` |
| Analytics Service | `http://localhost:3005` |
| RabbitMQ Management | `http://localhost:15672` |

RabbitMQ Management:

- Usuario: `campusconnect`
- Password: `campusconnect`

## Swagger

- Academic: `http://localhost:3001/docs`
- Payments: `http://localhost:3002/docs`
- Wellbeing: `http://localhost:3003/docs`
- Notifications: `http://localhost:3004/docs`
- Analytics: `http://localhost:3005/docs`

## Verificacion

```powershell
docker compose ps
curl http://localhost:5173/health
curl http://localhost:3001/health
curl http://localhost:3002/health
curl http://localhost:3003/health
curl http://localhost:3004/health
curl http://localhost:3005/health
```

Verificar Kong con API Key:

```powershell
curl -H "apikey: campusconnect-dev-api-key" http://localhost:8000/academic/students
```

## Frontend

El frontend se construye dentro de Docker con Vite y se sirve con Nginx. React Router funciona al refrescar rutas internas gracias al fallback a `index.html`.

Variables usadas en build:

```powershell
VITE_API_GATEWAY_URL=http://localhost:8000
VITE_NOTIFICATIONS_API_URL=http://localhost:3004
VITE_ANALYTICS_API_URL=http://localhost:3005
VITE_API_KEY=campusconnect-dev-api-key
```

Importante: las variables `VITE_*` quedan embebidas en el bundle durante el build. Si cambias estos valores, reconstruye el frontend:

```powershell
docker compose build frontend
docker compose up -d frontend
```

## Demo rapida

1. Abre `http://localhost:5173/dashboard`.
2. Registra un estudiante en `http://localhost:5173/academic/students/new`.
3. Registra o confirma un pago en `http://localhost:5173/payments`.
4. Registra asistencia en `http://localhost:5173/wellbeing/attendance/new`.
5. Registra un incidente en `http://localhost:5173/wellbeing/incidents/new`.
6. Vuelve al dashboard y actualiza los indicadores.

## Comandos utiles

Levantar todo:

```powershell
docker compose up --build
```

Levantar en segundo plano:

```powershell
docker compose up -d --build
```

Detener:

```powershell
docker compose down
```

Reconstruir:

```powershell
docker compose build
docker compose up -d
```

Ver logs:

```powershell
docker compose logs -f frontend
docker compose logs -f kong
```

## Troubleshooting

Si el frontend carga pero las APIs devuelven `401`, revisa que `VITE_API_KEY` en `.env` coincida con la key de desarrollo declarada en Kong.

Si cambiaste variables `VITE_*`, reconstruye el frontend porque Vite las aplica en tiempo de build.

El Dockerfile del frontend configura `npm strict-ssl=false` durante la etapa de build porque en algunos entornos Docker locales el registry npm presenta una cadena TLS no verificable por la imagen Node. Este ajuste aplica solo al build de desarrollo local.

Si `localhost:5173` no responde, valida:

```powershell
docker compose ps frontend
docker compose logs frontend
```
