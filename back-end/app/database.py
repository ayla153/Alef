from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, declarative_base, Session
from dotenv import load_dotenv
import os
from typing import Annotated
from fastapi import Depends

load_dotenv()
DB_USERNAME = os.getenv("DATABASE_USERNAME")
DB_PASSWORD = os.getenv("DATABASE_PASSWORD")
DB_HOST = os.getenv("DATABASE_HOST")
DB_PORT = os.getenv("DATABASE_PORT")
DB_NAME = os.getenv("DATABASE_NAME")
DB_SSLMODE = os.getenv("DATABASE_SSLMODE", "")

_base_url = f"postgresql://{DB_USERNAME}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
DATABASE_URL = f"{_base_url}?sslmode={DB_SSLMODE}" if DB_SSLMODE else _base_url

engine = create_engine(DATABASE_URL)


@event.listens_for(engine, "connect")
def _set_search_path(dbapi_connection, _connection_record) -> None:
    # Neon pooler forbids search_path in startup options; set per connection instead.
    with dbapi_connection.cursor() as cursor:
        cursor.execute("SET search_path TO public")

LocalSession = sessionmaker(bind=engine)

Base = declarative_base()

def get_db():
    db = LocalSession()
    try:
        yield db
    finally:
        db.close()

db_depends = Annotated[Session, Depends(get_db)]
