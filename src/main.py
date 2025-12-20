# src/main.py

from fastapi import FastAPI
from contextlib import asynccontextmanager
import logging
from common.database import Base, engine
from routers.router import router
from routers.auth import router as auth_router
from routers.service_requests import router as service_requests_router
from routers.ai_voice import router as ai_voice_router
from routers.buildings import router as buildings_router
from config.config import config  # Import config system
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware



def create_tables():
    try:
        print("Initializing database...")
        Base.metadata.create_all(bind=engine)
        print("Database tables created successfully.")
    except Exception as e:
        logging.error(f"Error creating tables: {e}")

# Load configurations
DATABASE_URL = config.get("DATABASE_URL")
BASE_DIR = config.base_dir

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (Replace with your frontend URL in production)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

    
    
# Include routers
app.include_router(router)  # Basic routes (e.g., /hello)
app.include_router(auth_router)  # Authentication & user management
app.include_router(service_requests_router)  # Service request CRUD
app.include_router(ai_voice_router)  # AI & voice endpoints
app.include_router(buildings_router)  # Building CRUD

