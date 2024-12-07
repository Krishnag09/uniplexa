# src/main.py

from fastapi import FastAPI
from src.router import router as auth_router
from src.router import router as root_router
from src.router import router as open_ai_query
from src.router import router as summary

from src.database import Base, engine

Base.metadata.create_all(bind=engine)

app = FastAPI()

# Include the auth router
app.include_router(auth_router, prefix="/auth")
app.include_router(root_router)
app.include_router(open_ai_query)
app.include_router(summary)
