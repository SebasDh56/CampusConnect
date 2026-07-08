from fastapi import FastAPI

from app.config import settings
from app.database import Base, engine
from app.health import router as health_router
from app import models
from app.routers import router as payments_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.service_name)
app.include_router(health_router)
app.include_router(payments_router)
