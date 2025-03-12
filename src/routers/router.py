from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from schemas import schemas

from models import models

import utils
from services import service_request as service
from common import database
from services import voice_methods as voice_service
import os
from config.config import config


# this is static for testing purposes.
AUDIO_DIR = os.path.join(config.base_dir, "audio")
audio_path = os.path.join(AUDIO_DIR, "LG-turbowash-audio.mp3")

router = APIRouter()

@router.get("/hello")
def read_root():
    return {"name": "Krish"}

@router.post("/register", response_model=schemas.UserCreate)
def register(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    try:
        return service.create_user(db, email=user.email, password=user.password)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/login", response_model=schemas.Token)
def login(user: schemas.UserLogin, db: Session = Depends(database.get_db)):
    try:
        db_user = service.authenticate_user(
            db, email=user.email, password=user.password)
        access_token_expires = timedelta(minutes=30)
        access_token = utils.create_access_token(
            data={"sub": db_user.email}, expires_delta=access_token_expires)
        return {"access_token": access_token, "token_type": "bearer"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/agent/query")
def open_ai_query():
    try:
        response = service.open_ai_query()
        return {"answer": response}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/service-request",response_model=schemas.ServiceRequest, description="details form the issue description")
def create_request(request: schemas.Summary, db: Session = Depends(database.get_db)):
    try:
        request_desc = request.desc
        request_title = utils.summarize_request(request.desc)
        request_category = utils.detect_category(request.desc)
        request_date_time = utils.get_date_time()
        request_status = schemas.RequestStatus.pending

        request = schemas.ServiceRequest(
            request_title=request_title, 
            request_desc=request_desc, 
            request_category=request_category,
            request_date=request_date_time["date"], 
            request_time=request_date_time["time"], 
            request_status=request_status
        )

        request_model = models.ServiceRequestModel(
            desc=request_desc, 
            title=request_title, 
            request_date=request_date_time["date"], 
            request_time=request_date_time["time"], 
            request_status=request_status
        )

        db.add(request_model)
        db.commit()
        db.refresh(request_model)
        return {
            "request_id": request_model.request_id, 
            "request_title": request_title, 
            "request_desc": request_desc, 
            "request_category": request_category, 
            "request_date": request_date_time["date"], 
            "request_time": request_date_time["time"], 
            "request_status": request_status
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/service-request", response_model=schemas.ServiceRequest, description="returns request details for the request id")
def get_request(request_id: int, db: Session = Depends(database.get_db)):
    try:
        request = db.query(models.ServiceRequestModel).filter(models.ServiceRequestModel.request_id == request_id).first()
        if not request:
            raise HTTPException(status_code=404, detail="Request not found")
        return request
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/service-request/status", response_model=schemas.ServiceRequest, description="returns request status for the request id")
async def get_request_status(request_id: int, db: Session = Depends(database.get_db)):
    request = await db.query(models.ServiceRequestModel).filter(models.ServiceRequestModel.request_id == request_id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    return request.request_status


@router.delete("/service-request", response_model=schemas.ServiceRequest, description="deletes the request for the request id")
async def delete_request(request_id: int, db: Session = Depends(database.get_db)):
    request = await db.query(models.ServiceRequestModel).filter(models.ServiceRequestModel.request_id == request_id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    await db.delete(request)
    await db.commit()
    return request

@router.get("/service-request/all", response_model=schemas.ServiceRequest, description="returns all the requests") # add filtering for status, user, building, etc.
async def get_all_requests(db: Session = Depends(database.get_db)):
    requests = await db.query(models.ServiceRequestModel).all()
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


@router.get("/voice-summary", response_model=schemas.ServiceRequest, description="returns request details for input voice")
async def consume_voice_api():
    audio_path = os.path.join(AUDIO_DIR, "LG-turbowash-audio.mp3")
    voice_to_text = voice_service.audio_to_text(audio_path)
    print(f"Voice to Text: {voice_to_text}")
    request_details = voice_service.summarize_message(voice_to_text)
    return schemas.ServiceRequest(
        request_title=request_details["request_title"], request_desc=request_details["request_desc"], request_category=request_details["request_category"], request_date=request_details["request_date"], request_time=request_details["request_time"], request_status=request_details["request_status"]
        )
