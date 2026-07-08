from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    service_name: str = "academic-service"
    app_env: str = "local"
    port: int = 8080
    database_host: str = "academic-db"
    database_port: int = 5432
    database_name: str = "academic_db"
    database_user: str = "academic_user"
    database_password: str = "academic_password"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def database_url(self) -> str:
        return (
            f"postgresql+psycopg://{self.database_user}:{self.database_password}"
            f"@{self.database_host}:{self.database_port}/{self.database_name}"
        )


settings = Settings()
