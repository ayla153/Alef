import os

from dotenv import load_dotenv

load_dotenv()


def _cors_origins_from_env() -> list[str]:
    raw = os.getenv("CORS_ORIGINS", "").strip()
    if raw:
        return [origin.strip() for origin in raw.split(",") if origin.strip()]
    return [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]


class Settings:
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    REGISTRATION_TOKEN_EXPIRE_MINUTES: int = int(
        os.getenv("REGISTRATION_TOKEN_EXPIRE_MINUTES", "10080")
    )  # default 7 days
    CORS_ORIGINS: list[str] = _cors_origins_from_env()


settings = Settings()
