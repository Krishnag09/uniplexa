
from datetime import timedelta

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from . import utils
from .services import service_request as service
from . import database, schemas, models
from .services import voice_test as voice_service

from fastapi import HTTPException

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

@router.post("/service-request",response_model=schemas.ServiceRequest, description="details form the issue description")
def create_request(request: schemas.Summary, db: Session = Depends(database.get_db)):
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

@router.get("/service-request", response_model=schemas.ServiceRequest, description="returns request details for the request id")
def get_request(request_id: int, db: Session = Depends(database.get_db)):
    request = db.query(models.ServiceRequestModel).filter(models.ServiceRequestModel.request_id == request_id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    return request

@router.delete("/service-request", response_model=schemas.ServiceRequest, description="deletes the request for the request id")
def delete_request(request_id: int, db: Session = Depends(database.get_db)):
    request = db.query(models.ServiceRequestModel).filter(models.ServiceRequestModel.request_id == request_id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    db.delete(request)
    db.commit()
    return request

@router.get("/service-request/all", response_model=schemas.ServiceRequest, description="returns all the requests") # add filtering for status, user, building, etc.
def get_all_requests(db: Session = Depends(database.get_db)):
    requests = db.query(models.ServiceRequestModel).all()
    return requests


@router.patch("/service-requests/{request_id}", response_model=schemas.ServiceRequestPatch)
def patch_service_request(
    request_id: int,
    request_data: schemas.ServiceRequestPatch,
    db: Session = Depends(database.get_db),
):
    # Fetch the existing service request
    db_request = db.query(models.ServiceRequestModel).filter(
        models.ServiceRequestModel.request_id == request_id
    ).first()
    if not db_request:
        raise HTTPException(status_code=404, detail="Service request not found")

    # Update only the fields provided in the request_data
    update_data = request_data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_request, key, value)  # Dynamically update attributes

    db.commit()
    db.refresh(db_request)  # Refresh the instance with the updated database data
    return schemas.ServiceRequestPatch(
        request_desc=db_request.request_desc,
        request_title=db_request.request_title,
        request_date=db_request.request_date,
        request_time=db_request.request_time,
        request_status=db_request.request_status,
    )
    
@router.get("/voice")
def consume_voice_api_local():
    response = voice_service.consume_audio_api_local()
    print(f"Voice Response: {response}")
    return response


@router.get("/voice-api")
def consume_voice_api():
    response = voice_service.consume_voice_api()
    print(f"Voice Response: {response}")
    return response