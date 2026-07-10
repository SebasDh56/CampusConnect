from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    service_name: str = "academic-service"
    app_env: str = "local"
    port: int = 3001
    database_host: str = "academic-db"
    database_port: int = 5432
    database_name: str = "academic_db"
    database_user: str = "academic_user"
    database_password: str = "academic_password"
    rabbitmq_host: str = "rabbitmq"
    rabbitmq_port: int = 5672
    rabbitmq_user: str = "campus_user"
    rabbitmq_password: str = "campus_pass"
    rabbitmq_vhost: str = "campusconnect"
    rabbitmq_exchange: str = "campusconnect.events"
    rabbitmq_payment_queue: str = "academic.payment-confirmed.queue"
    rabbitmq_dead_letter_exchange: str = "campusconnect.dead-letter"
    rabbitmq_dead_letter_queue: str = "campusconnect.dead-letter.queue"
    rabbitmq_dead_letter_routing_key: str = "dead-letter"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def database_url(self) -> str:
        return (
            f"postgresql+psycopg://{self.database_user}:{self.database_password}"
            f"@{self.database_host}:{self.database_port}/{self.database_name}"
        )


settings = Settings()
