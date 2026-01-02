from sqlalchemy import create_engine
from models.models import Base  # Import your Base from models.py
from config.config import config  # Import your config for DATABASE_URL

# Get database URL from config (supports environment variables)
database_url = config.get("DATABASE_URL", "sqlite:///./test.db")

# Create the engine
engine = create_engine(database_url)

# Drop all tables
print("Dropping all tables...")
Base.metadata.drop_all(bind=engine)

# Recreate all tables
print("Recreating all tables...")
Base.metadata.create_all(bind=engine)

print("Database schema reset successfully!")