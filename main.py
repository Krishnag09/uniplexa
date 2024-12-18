# src/main.py

from fastapi import FastAPI
from src.router import router as auth_router
from src.router import router as router
from contextlib import asynccontextmanager
import logging
from src.database import Base, engine


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
app.include_router(auth_router, prefix="/auth")
app.include_router(router)

