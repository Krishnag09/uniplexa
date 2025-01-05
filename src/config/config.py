# src/auth/config.py

# import os

# from dotenv import load_dotenv

# load_dotenv()


# SECRET_KEY = os.getenv("SECRET_KEY", "default_secret_key")
# ALGORITHM = "HS256"
# ACCESS_TOKEN_EXPIRE_MINUTES = 30
# DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./test.db")
# BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


import os
import json

class Config:
    def __init__(self, config_file="config.json"):
        # Locate the JSON file relative to this script's directory
        self._base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        config_path = os.path.join(self.base_dir, "config", config_file)
        
        # Load the JSON config file
        with open(config_path, "r") as file:
            self.config_data = json.load(file)

    def get(self, key, default=None):
        """Get a configuration value by key with an optional default."""
        # Check environment variables first, then fall back to JSON
        return os.getenv(key, self.config_data.get(key, default))

    @property
    def base_dir(self):
        """Return the base directory of the project."""
        return self._base_dir

# Create a global config instance
config = Config()
