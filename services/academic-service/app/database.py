from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from sqlalchemy.orm import DeclarativeBase

from app.config import settings


class Base(DeclarativeBase):
    pass


engine = create_engine(settings.database_url, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db() -> None:
    from app import models

    Base.metadata.create_all(bind=engine)
    with engine.begin() as connection:
        connection.execute(text("UPDATE students SET academic_year = 'UNKNOWN' WHERE academic_year IS NULL"))
        connection.execute(text("ALTER TABLE students ALTER COLUMN academic_year SET NOT NULL"))
        connection.execute(text("ALTER TABLE students ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP"))
        connection.execute(text("UPDATE students SET updated_at = created_at WHERE updated_at IS NULL"))
        connection.execute(text("ALTER TABLE students ALTER COLUMN updated_at SET NOT NULL"))


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
