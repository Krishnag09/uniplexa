
from datetime import timedelta

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from . import database, schemas, service, utils, models

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

@router.post("/agent/summary",response_model=schemas.ServiceRequest, description="details form the issue description")
def summary(request: schemas.Summary, db: Session = Depends(database.get_db)):
    request_desc = request.desc
    request_title = utils.summarize_request(request.desc)
    request_category = utils.detect_category(request.desc)
    request_date_time = utils.get_date_time()
    request_status = schemas.RequestStatus.pending
    
    request = schemas.ServiceRequest(request_title=request_title , request_desc=request_desc, request_category=request_category,request_date=request_date_time["date"], request_time=request_date_time["time"], request_status=request_status)
    
    request_model = models.ServiceRequestModel(desc=request_desc, title=request_title, request_date=request_date_time["date"], request_time=request_date_time["time"], request_status=request_status)
    
    db.add(request_model)
    request_model_id = db.commit()
    db.commit()
    db.refresh(request_model)
    print(f"Request ID: {request_model_id}")
    return{"request_id": request_model_id, "request_title": request_title, "request_desc": request_desc, "request_category": request_category, "request_date": request_date_time["date"], "request_time": request_date_time["time"], "request_status": request_status}
