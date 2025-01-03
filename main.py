# src/main.py

from fastapi import FastAPI
from contextlib import asynccontextmanager
import logging
from src.common.database import Base, engine
from src.routers.router import router


def create_tables():
    try:
        print("Initializing database...")
        Base.metadata.create_all(bind=engine)
        print("Database tables created successfully.")
    except Exception as e:
        logging.error(f"Error creating tables: {e}")

app = FastAPI()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic: Initialize the database
    create_tables()
    yield  # Application runs after this
    # Shutdown logic (if needed)
    print("Shutting down...")
    
    
# Include the auth router
app.include_router(router)

