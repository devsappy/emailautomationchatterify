import os
from dataclasses import dataclass
from typing import Optional


def _load_dotenv():
    """Load .env file into environment variables if it exists."""
    backend_dir = os.path.dirname(__file__)
    project_root = os.path.dirname(backend_dir)
    env_path = os.path.join(project_root, ".env")

    if not os.path.exists(env_path):
        env_path = os.path.join(backend_dir, ".env")

    if not os.path.exists(env_path):
        return

    with open(env_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            key = key.strip()
            value = value.strip().strip('"').strip("'")
            # Only set if not already present in real environment
            if key not in os.environ:
                os.environ[key] = value


# Auto-load .env on import
_load_dotenv()


@dataclass
class EmailConfig:
    """Configuration for Hostinger email automation."""

    # Required
    HOSTINGER_EMAIL: str = ""
    HOSTINGER_PASSWORD: str = ""

    # SMTP Settings (Hostinger defaults)
    SMTP_SERVER: str = "smtp.hostinger.com"
    SMTP_PORT: int = 587
    USE_TLS: bool = True

    # Optional defaults
    DEFAULT_REPLY_TO: Optional[str] = None

    @classmethod
    def from_env(cls) -> "EmailConfig":
        """Load configuration from environment variables."""
        return cls(
            HOSTINGER_EMAIL=os.getenv("HOSTINGER_EMAIL", ""),
            HOSTINGER_PASSWORD=os.getenv("HOSTINGER_PASSWORD", ""),
            SMTP_SERVER=os.getenv("SMTP_SERVER", "smtp.hostinger.com"),
            SMTP_PORT=int(os.getenv("SMTP_PORT", "587")),
            USE_TLS=os.getenv("USE_TLS", "true").lower() == "true",
            DEFAULT_REPLY_TO=os.getenv("DEFAULT_REPLY_TO")
        )
    
    @classmethod
    def from_dict(cls, config_dict: dict) -> "EmailConfig":
        """Load configuration from a dictionary."""
        return cls(
            HOSTINGER_EMAIL=config_dict.get("email", ""),
            HOSTINGER_PASSWORD=config_dict.get("password", ""),
            SMTP_SERVER=config_dict.get("smtp_server", "smtp.hostinger.com"),
            SMTP_PORT=config_dict.get("smtp_port", 587),
            USE_TLS=config_dict.get("use_tls", True),
            DEFAULT_REPLY_TO=config_dict.get("reply_to")
        )
    
    def validate(self) -> bool:
        """Check if required fields are set."""
        return bool(self.HOSTINGER_EMAIL and self.HOSTINGER_PASSWORD)
