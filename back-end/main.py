from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.api.routers.auth import router as auth_router
from app.api.routers.Admins import router as admin_router
from app.core.config import settings
from app.database import Base, engine
from app.models import cities
from contextlib import asynccontextmanager
from app.api.routers.Tutors import Tutors_router

print(Base.metadata.tables.keys())
from app.models import cities  # noqa: F401 — triggers dynamic model imports


@asynccontextmanager
async def lifespan(app: FastAPI):
    if not settings.JWT_SECRET_KEY:
        raise RuntimeError("JWT_SECRET_KEY environment variable must be set for authentication.")
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(lifespan=lifespan)

app.include_router(Tutors_router.router)
app.include_router(admin_router)

app.include_router(auth_router)