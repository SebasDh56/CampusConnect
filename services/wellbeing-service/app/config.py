from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    service_name: str = "wellbeing-service"
    app_env: str = "local"
    port: int = 3003
    database_host: str = "wellbeing-db"
    database_port: int = 5432
    database_name: str = "wellbeing_db"
    database_user: str = "wellbeing_user"
    database_password: str = "wellbeing_password"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def database_url(self) -> str:
        return (
            f"postgresql+psycopg://{self.database_user}:{self.database_password}"
            f"@{self.database_host}:{self.database_port}/{self.database_name}"
        )


settings = Settings()
