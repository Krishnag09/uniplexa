from sqlalchemy import create_engine
from models.models import Base  # Import your Base from models.py
from config.config import config  # Import your config for DATABASE_URL

# Create the engine
engine = create_engine(config.get("'/Users/krishnagaurav/uniplexa/test.db"))

# Drop all tables
print("Dropping all tables...")
Base.metadata.drop_all(bind=engine)

# Recreate all tables
print("Recreating all tables...")
Base.metadata.create_all(bind=engine)

print("Database schema reset successfully!")