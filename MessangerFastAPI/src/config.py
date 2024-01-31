from pydantic_settings import BaseSettings, SettingsConfigDict

from functools import lru_cache


class Settings(BaseSettings):
    env_name: str = 'Local'
    base_url: str = 'http://localhost:8000'
    db_uri: str
    crypt_key: bytes

    SMTP_USER: str
    SMTP_PASSWORD: str
    SMTP_HOST: str
    SMTP_PORT: int 

    SECRET: str

    class Config:
        env_file = '../.env'


@lru_cache
def get_settings() -> Settings:
    settings = Settings()
    #print(settings.db_uri)
    return settings
