from fastapi import FastAPI
from app.database import Base, engine
from app.models import cities
from contextlib import asynccontextmanager
print(Base.metadata.tables.keys())
@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield

app = FastAPI(lifespan=lifespan)