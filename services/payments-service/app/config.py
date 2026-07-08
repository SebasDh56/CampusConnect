from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    service_name: str = "payments-service"
    app_env: str = "local"
    port: int = 3002
    database_host: str = "payments-db"
    database_port: int = 5432
    database_name: str = "payments_db"
    database_user: str = "payments_user"
    database_password: str = "payments_password"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def database_url(self) -> str:
        return (
            f"postgresql+psycopg://{self.database_user}:{self.database_password}"
            f"@{self.database_host}:{self.database_port}/{self.database_name}"
        )


settings = Settings()
