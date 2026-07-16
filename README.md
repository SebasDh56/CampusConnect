# CampusConnect 360

CampusConnect 360 es una plataforma pensada para conectar las operaciones de una red de colegios en un solo lugar. El proyecto integra los procesos académicos, pagos, bienestar estudiantil, notificaciones y analítica usando microservicios que se comunican tanto por HTTP como por eventos.

Todo el entorno se levanta con Docker Compose, así que no hace falta configurar cada servicio a mano. Al iniciar el proyecto se ejecutan el frontend, Kong, RabbitMQ, cinco microservicios y una base PostgreSQL independiente para cada servicio que necesita persistencia.

## Lo que incluye

- Registro y consulta de estudiantes.
- Registro de deudas y confirmación de pagos.
- Registro de asistencias e incidentes.
- Notificaciones generadas a partir de eventos.
- Consolidación de eventos para analítica.
- Dashboard con el estado general de la plataforma.
- API Gateway con API Key para las rutas de negocio.
- Manejo de eventos duplicados y mensajes fallidos mediante una Dead Letter Queue.
- Pruebas automáticas, smoke test y colección de Postman.

## Antes de empezar

Solo necesitas tener instalado:

- Git.
- Docker Desktop, o Docker Engine con Docker Compose v2.

Node.js y Python son necesarios únicamente si quieres ejecutar las pruebas directamente desde tu máquina. Para levantar la aplicación completa basta con Docker.

## Cómo levantar el proyecto

```powershell
git clone https://github.com/SebasDh56/CampusConnect.git
cd CampusConnect
Copy-Item .env.example .env
docker compose up -d --build
```

La primera construcción puede tardar unos minutos. Cuando termine, revisa que todos los contenedores estén saludables:

```powershell
docker compose ps
```

Durante el primer arranque, el servicio `demo-seed` carga un estudiante, un pago confirmado, una asistencia y un incidente mediante las APIs. De esta forma también se generan los eventos, notificaciones e indicadores correspondientes. El contenedor termina con código `0` cuando la carga fue correcta:

```powershell
docker compose ps -a demo-seed
```

Luego puedes entrar a:

- Aplicación: `http://localhost:5173`
- Dashboard: `http://localhost:5173/dashboard`
- API Gateway: `http://localhost:8000`
- Administración de Kong: `http://localhost:8001`
- Administración de RabbitMQ: `http://localhost:15672`

Para RabbitMQ usa estas credenciales locales:

- Usuario: `campus_user`
- Contraseña: `campus_pass`

## Actores de demostración

La seguridad técnica usa API Key, por lo que el proyecto no tiene una pantalla de login. Para representar a los actores de la consigna se incluyen estos perfiles de prueba en `demo/demo-data.json`:

| Actor | Identificador | Sección |
|---|---|---|
| Secretaría | `secretaria.demo` | Académico |
| Finanzas | `finanzas.demo` | Pagos |
| Docente | `docente.demo` | Bienestar / asistencia |
| Bienestar | `bienestar.demo` | Bienestar / incidentes |

Son identidades funcionales para la demostración, no cuentas con contraseña. La autorización de las APIs sigue estando a cargo de Kong mediante `campusconnect-dev-api-key`.

## Recorrido rápido

La forma más sencilla de probar el sistema desde la interfaz es esta:

1. Registra un estudiante.
2. Crea una deuda y confirma el pago.
3. Registra una asistencia.
4. Reporta un incidente.
5. Regresa al dashboard y actualiza los indicadores.

Cada acción genera los eventos correspondientes. Notifications y Analytics los procesan en segundo plano, por lo que los resultados pueden tardar un par de segundos en aparecer.

En los formularios de Finanzas y Bienestar el estudiante se selecciona desde los registros de Academic Service. Su colegio y, cuando corresponde, su grado se completan automáticamente. La ficha académica también muestra el historial de eventos asociado al estudiante.

Si quieres volver a ejecutar la carga demo sin recrear los volúmenes:

```powershell
docker compose run --rm demo-seed
```

El proceso es idempotente: reutiliza el estudiante y el pago identificados en `demo/demo-data.json` y evita duplicar la asistencia o el incidente de demostración.

## Servicios y documentación Swagger

| Servicio | API | Swagger |
|---|---|---|
| Academic | `http://localhost:3001` | `http://localhost:3001/docs` |
| Payments | `http://localhost:3002` | `http://localhost:3002/docs` |
| Wellbeing | `http://localhost:3003` | `http://localhost:3003/docs` |
| Notifications | `http://localhost:3004` | `http://localhost:3004/docs` |
| Analytics | `http://localhost:3005` | `http://localhost:3005/docs` |

Aunque los puertos directos están disponibles para Swagger, health checks y diagnóstico local, el frontend consume las cinco APIs mediante Kong.

## API Key local

Kong protege las rutas de negocio usando el header `apikey`. La clave incluida para desarrollo es:

```text
campusconnect-dev-api-key
```

Por ejemplo:

```powershell
curl http://localhost:8000/academic/students
curl -H "apikey: campusconnect-dev-api-key" http://localhost:8000/academic/students
```

La primera petición responde `401` porque no tiene credenciales. La segunda sí llega a Academic Service.

Esta clave es únicamente para el entorno local. Está definida en `.env.example` y coincide con el consumer configurado en `infrastructure/gateway/kong.yml`.

## Cómo comprobar que todo funciona

El proyecto incluye un smoke test que recorre el flujo principal de inicio a fin. Primero levanta el entorno y luego ejecuta:

```powershell
python scripts/smoke_test.py
```

La prueba comprueba lo siguiente:

- rechazo de peticiones sin API Key;
- health checks de los cinco servicios;
- registro de estudiante, deuda, pago, asistencia e incidente;
- actualización del estado financiero del estudiante a `PAID`;
- procesamiento de eventos en Analytics;
- creación de notificaciones;
- rechazo de un evento inválido y envío a la Dead Letter Queue;
- idempotencia al publicar dos veces el mismo `eventId`.

Al terminar muestra un JSON con los identificadores creados y el resultado de cada parte del flujo.

También está disponible la colección `postman/CampusConnect-360.postman_collection.json` para hacer el recorrido manualmente desde Postman.

## Pruebas automáticas

Pruebas de contratos y utilidades del flujo:

```powershell
python -m unittest discover -s tests -v
```

Pruebas y build del frontend:

```powershell
cd frontend
npm ci
npm test
npm run build
cd ..
```

Pruebas de los consumidores de RabbitMQ:

```powershell
cd services/notifications-service
python -m unittest discover -s tests -v

cd ../analytics-service
python -m unittest discover -s tests -v
```

El mismo conjunto de validaciones se ejecuta en GitHub Actions cuando se suben cambios al repositorio.

## Qué pasa cuando falla un evento

Notifications y Analytics tienen colas separadas. Si uno de estos consumidores recibe un evento inválido, guarda el intento como `FAILED` cuando todavía puede identificar su `eventId`, rechaza el mensaje sin reencolarlo y RabbitMQ lo mueve a `campusconnect.dead-letter.queue`.

Puedes revisar las colas con:

```powershell
docker exec campusconnect-rabbitmq rabbitmqctl -p campusconnect list_queues name messages consumers
```

Si cambias la configuración de RabbitMQ y ya habías levantado una versión anterior, recrea los volúmenes locales para que se aplique la nueva topología:

```powershell
docker compose down -v
docker compose up -d --build
```

## Comandos que usamos normalmente

```powershell
# Levantar o reconstruir todo
docker compose up -d --build

# Ver el estado de los contenedores
docker compose ps

# Seguir los logs
docker compose logs -f

# Detener el proyecto sin borrar los datos
docker compose down

# Detenerlo y borrar los volúmenes locales
docker compose down -v
```

## Si algo no levanta

Si el frontend abre pero las APIs responden `401`, revisa que `VITE_API_KEY` en tu archivo `.env` sea igual a la clave configurada en Kong.

Si cambiaste alguna variable `VITE_*`, reconstruye el frontend porque Vite agrega esos valores durante el build:

```powershell
docker compose build frontend
docker compose up -d frontend
```

Si una página o servicio no responde, empieza revisando su estado y sus logs:

```powershell
docker compose ps
docker compose logs frontend kong
```

El Dockerfile del frontend desactiva `strict-ssl` de npm únicamente durante el build local. Esto evita problemas con certificados del registry en algunos entornos Docker y no cambia la seguridad de las APIs de la plataforma.
