from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "IoT AI System"
    app_env: str = "development"

    database_url: str = "sqlite+aiosqlite:///./data/iot.db"
    api_v1_prefix: str = "/api/v1"

    blynk_base_url: str = "https://blynk.cloud"
    blynk_auth_token: str
    blynk_template_id: str
    blynk_device_id: str = "ESP32-001"
    openai_api_key: str = ""
    openai_model: str = "gpt-4o-mini"
    openai_base_url: str = "https://api.openai.com/v1"
    ai_provider: str = "openai"
    gemini_api_key: str = ""
    gemini_model: str = "gemini-2.5-flash"
    gemini_base_url: str = "https://generativelanguage.googleapis.com/v1beta"
    groq_api_key: str = ""
    groq_model: str = "qwen/qwen3.8-27b"
    groq_base_url: str = "https://api.groq.com/openai/v1"
    jwt_secret_key: str = "change-this-secret-in-production"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    auth_cookie_name: str = "access_token"
    auth_cookie_secure: bool = False

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
    )


settings = Settings()