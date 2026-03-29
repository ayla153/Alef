import os

from dotenv import load_dotenv

load_dotenv()


class Settings:
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    REGISTRATION_TOKEN_EXPIRE_MINUTES: int = int(
        os.getenv("REGISTRATION_TOKEN_EXPIRE_MINUTES", "10080")
    )  # default 7 days


settings = Settings()
