from fastapi import FastAPI

from app.config import settings
from app.database import init_db
from app.health import router as health_router
from app.routers.students import router as students_router

init_db()

app = FastAPI(title=settings.service_name)
app.include_router(health_router)
app.include_router(students_router)
