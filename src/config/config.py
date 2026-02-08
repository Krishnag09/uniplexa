# src/auth/config.py

import json
import os

from dotenv import load_dotenv

# Always load `.env` from the backend `src/` directory (base dir),
# regardless of the process working directory (cwd).
_BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
_ENV_PATH = os.path.join(_BASE_DIR, ".env")
load_dotenv(_ENV_PATH)


class Config:
    def __init__(self, config_file="config.json"):
        # Locate the JSON file relative to this script's directory
        self._base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        config_path = os.path.join(self.base_dir, "config", config_file)
        
        # Load the JSON config file
        with open(config_path, "r") as file:
            self.config_data = json.load(file)
        
        # Load all credentials (env vars first, then config.json)
        # JWT Configuration
        self.SECRET_KEY = os.getenv("SECRET_KEY")
        self.ALGORITHM = os.getenv("ALGORITHM", "HS256")
        
        # SMTP Email Configuration (env vars first, then config.json)
        self.SMTP_USERNAME = self.get("SMTP_USERNAME")
        self.SMTP_PASSWORD = self.get("SMTP_PASSWORD")
        self.SMTP_SERVER = self.get("SMTP_SERVER", "smtp.hostinger.com")
        self.SMTP_PORT = int(self.get("SMTP_PORT", "465"))
        
        # OpenAI API Configuration
        self.OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

        # Frontend links (for email templates)
        self.SIGN_UP_LINK = self.get("SIGN_UP_LINK", "https://uniplexa.com/set_password")
        self.PASSWORD_RESET_LINK = self.get("PASSWORD_RESET_LINK", "https://uniplexa.com/reset_password")
        self.SIGNIN_LINK = self.get("SIGNIN_LINK", "https://uniplexa.com/signin")
        self.PASSWORD_RESET_TIME = int(self.get("PASSWORD_RESET_TIME", "5"))
        
        # Validate required credentials
        if not self.SECRET_KEY or not self.ALGORITHM:
            raise ValueError("SECRET_KEY and ALGORITHM must be set in the environment variables.")
        
        # Optional: Warn if sensitive credentials are missing (but don't fail)
        if not self.SMTP_USERNAME or not self.SMTP_PASSWORD:
            print("Warning: SMTP credentials not set. Email functionality may not work.")
        
        if not self.OPENAI_API_KEY:
            print("Warning: OPENAI_API_KEY not set. OpenAI functionality may not work.")

    def get(self, key, default=None):
        """Get a configuration value by key with an optional default.
        Priority: Environment variables > JSON config > default value
        """
        # Check environment variables first, then fall back to JSON
        return os.getenv(key, self.config_data.get(key, default))

    @property
    def base_dir(self):
        """Return the base directory of the project."""
        return self._base_dir

# Create a global config instance
config = Config()
