# src/common/database.py

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from .models import Base

from .config import DATABASE_URL

# Create engine and session
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create all tables defined in the models
Base.metadata.create_all(bind=engine)

# Dependency for getting the database session

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
