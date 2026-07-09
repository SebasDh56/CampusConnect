from fastapi import FastAPI

from app.config import settings
from app.database import init_db
from app.health import router as health_router
from app import models
from app.routers.attendance import router as attendance_router
from app.routers.incidents import router as incidents_router

init_db()

app = FastAPI(title=settings.service_name)
app.include_router(health_router)
app.include_router(attendance_router)
app.include_router(incidents_router)
