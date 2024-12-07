
from datetime import timedelta

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from . import database, schemas, service, utils

router = APIRouter()

@router.get("/")
def read_root():
    return {"Hello": "World"}

@router.post("/register", response_model=schemas.UserCreate)
def register(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    return service.create_user(db, email=user.email, password=user.password)


@router.post("/login", response_model=schemas.Token)
def login(user: schemas.UserLogin, db: Session = Depends(database.get_db)):
    db_user = service.authenticate_user(
        db, email=user.email, password=user.password)
    access_token_expires = timedelta(minutes=30)
    access_token = utils.create_access_token(
        data={"sub": db_user.email}, expires_delta=access_token_expires)
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/agent/query")
def open_ai_query():
    response = service.open_ai_query()
    return {"answer": response}

@router.post("/summary")
def summary(text):
    return utils.summarize_request(text)
