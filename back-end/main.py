from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routers.auth import router as auth_router
from app.api.routers.Tutors.Tutors_router import router as tutors_router
from app.api.routers.Admins import router as admin_router
from app.api.routers.Subjects import router as subject_router
from app.api.routers.Levels import router as level_router
from app.api.routers.Students import router as students_router
from app.api.routers.Cities import router as cities_router
from app.api.routers.Areas import router as areas_router
from app.api.routers.Addresses import router as addresses_router
from app.api.routers.Reviews.Reviews_router import router as reviews_router
from app.api.routers.Favorites.Favorites_router import router as favorites_router
from app.api.routers.Leads import router as leads_router
from app.api.routers.Notifications.Notifications_router import router as notifications_router
from app.api.routers.Notifications.Notifications_router import ws_router
from app.core.config import settings
from app.database import Base, engine
from app.db_migrations import upgrade_database_if_needed
from app.models import cities  # noqa: F401 — triggers dynamic model imports

print(Base.metadata.tables.keys())


@asynccontextmanager
async def lifespan(app: FastAPI):
    if not settings.JWT_SECRET_KEY:
        raise RuntimeError("JWT_SECRET_KEY environment variable must be set for authentication.")
    upgrade_database_if_needed(engine)
    yield


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(tutors_router)
app.include_router(admin_router)
app.include_router(subject_router)
app.include_router(level_router)
app.include_router(students_router)
app.include_router(cities_router)
app.include_router(areas_router)
app.include_router(addresses_router)
app.include_router(reviews_router)
app.include_router(favorites_router)
app.include_router(leads_router)
app.include_router(notifications_router)
app.include_router(ws_router)
app.include_router(auth_router)
