import os

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from utils.utils import summarize_request, detect_category, get_date_time
from common import database
from config.config import config
from models import models
from schemas import schemas

router = APIRouter()


@router.post("/service-request", response_model=schemas.ServiceRequest, description="details form the issue description")
def create_request(request: schemas.Summary, db: Session = Depends(database.get_db)):
    try:
        request_description = request.desc
        building_id = request.building_id
        request_title = summarize_request(request_description)
        request_category = detect_category(request_description)
        request_date_time = get_date_time()
        request_status = schemas.RequestStatus.pending
        
        request_model = models.ServiceRequestModel(
            request_desc=request_description, 
            request_title=request_title, 
            request_date=request_date_time["date"], 
            request_time=request_date_time["time"], 
            request_category=request_category,
            request_status=request_status,
            building_id=building_id
        )

        db.add(request_model)
        db.commit()
        db.refresh(request_model)
        request_id = request_model.request_id  # Access the generated primary key after commit
        return {
            "request_id": request_id,
            "user_id": request_model.user_id,
            "building_id": building_id,
            "request_title": request_title, 
            "request_desc": request_description, 
            "request_category": request_category, 
            "request_date": request_date_time["date"], 
            "request_time": request_date_time["time"], 
            "request_status": request_status
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/service-request/{request_id}", response_model=schemas.ServiceRequest, description="Returns request details for the given request ID")
def get_request(request_id: int, db: Session = Depends(database.get_db)):
    try:
        request = db.query(models.ServiceRequestModel).filter(models.ServiceRequestModel.request_id == request_id).first()
        if not request:
            raise HTTPException(status_code=404, detail="Request not found")
        return request
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/service-request/status/{request_id}", response_model=schemas.ServiceRequestStatusResponse, description="returns request status for the request id")
def get_request_status(request_id: int, db: Session = Depends(database.get_db)):
    request = db.query(models.ServiceRequestModel).filter(models.ServiceRequestModel.request_id == request_id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    return {"request_status": request.request_status}


@router.delete("/service-request/{request_id}", response_model=None, description="deletes the request for the request id")
def delete_request(request_id: int, db: Session = Depends(database.get_db)):
    request = db.query(models.ServiceRequestModel).filter(models.ServiceRequestModel.request_id == request_id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    db.delete(request)
    db.commit()
    return request


@router.get("/service-request/all/{building_id}", response_model=schemas.ServiceRequestAllResponse, description="returns a list requests for the given building id") # add filtering for status, user, building, etc.
def get_all_requests(building_id: int, db: Session = Depends(database.get_db)):
    requests = db.query(models.ServiceRequestModel).filter(models.ServiceRequestModel.building_id == building_id).all()
    return {"requests": requests}


@router.patch("/service-request/{request_id}", response_model=schemas.ServiceRequestAllResponse, description="Updates a service request (partial update)")
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
    print(f"Updated request: {db_request}")
    # Return the full ServiceRequest with all fields
    new_request = schemas.ServiceRequest(
        request_id=db_request.request_id,
        user_id=db_request.user_id,
        building_id=db_request.building_id,
        request_desc=db_request.request_desc,
        request_title=db_request.request_title,
        request_category=db_request.request_category,
        request_date=db_request.request_date,
        request_time=db_request.request_time,
        request_status=db_request.request_status,
    )
    return new_request

