# src/main.py

from fastapi import FastAPI
from contextlib import asynccontextmanager
import logging
from common.database import Base, engine
from routers.router import router
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

# Serve React's static files (CSS, JS, etc.)
app.mount("/static", StaticFiles(directory="static/build/static"), name="static")

# Serve React's index.html at the root
@app.get("/")
def serve_react():
    return FileResponse("static/build/index.html")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic: Initialize the database
    create_tables()
    yield  # Application runs after this
    # Shutdown logic (if needed)
    print("Shutting down...")
    
    
# Include the auth router
app.include_router(router)

