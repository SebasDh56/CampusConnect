from fastapi import FastAPI

from app.config import settings
from app.database import init_db
from app.health import router as health_router
from app import models
from app.routers.payments import router as payments_router

init_db()

app = FastAPI(title=settings.service_name)
app.include_router(health_router)
app.include_router(payments_router)
