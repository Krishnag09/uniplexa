# src/main.py

from fastapi import FastAPI
from src.router import router as auth_router
from src.router import router as router

from src.database import Base, engine

Base.metadata.create_all(bind=engine)

app = FastAPI()

# Include the auth router
app.include_router(auth_router, prefix="/auth")
app.include_router(router)

