from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "IoT AI System"
    app_env: str = "development"

    database_url: str = "sqlite+aiosqlite:///./data/iot.db"
    api_v1_prefix: str = "/api/v1"

    blynk_base_url: str = "https://blynk.cloud"
    blynk_auth_token: str

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
    )


settings = Settings()