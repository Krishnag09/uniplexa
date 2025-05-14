from fastapi import APIRouter, Depends, HTTPException, WebSocket
from sqlalchemy.orm import Session

from schemas import schemas

from models import models

import utils
from services import service_request as service
from common import database
from services import voice_methods as voice_service
from services import signup as signup_service
import os
from config.config import config
import speech_recognition as sr
from services import voice_methods
from io import BytesIO
from datetime import timedelta
from common.constants import PASSWORD_RESET_TIME, PASSWORD_RESET_LINK, SIGN_UP_LINK
from common.constants import  NEW_USER_TOKEN_EXPIRE_MINUTES
from utils import email_utils
from pydantic import BaseModel
from utils.utils import admin_role_dependency

# this is static for testing purposes.
AUDIO_DIR = os.path.join(config.base_dir, "audio")
audio_path = os.path.join(AUDIO_DIR, "LG-turbowash-audio.mp3")

router = APIRouter()

class SignupLinkResponse(BaseModel):
    signup_link: str

@router.get("/hello")
def read_root():
    return {"name": "Krish"}

@router.post("/register", response_model=schemas.UserCreate, description="Registers a new user")
def register(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    try:
        return signup_service.create_user(db, email=user.email, password=user.password)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/add_user", response_model=schemas.SignupLinkResponse, description="Adds a new user")
def add_user(
    request: schemas.AddUserRequest,
    db: Session = Depends(database.get_db),
    admin: None = Depends(admin_role_dependency)  # Inject admin role validation
):
    try:
        # Extract data from the request model
        email = request.email
        user_role = request.user_role
        building_id = request.building_id

        # Check if the user already exists
        user = db.query(models.UserModel).filter(models.UserModel.email == email).first()
        if user:
            raise HTTPException(status_code=400, detail="Email already registered")

        # Generate a signup token
        new_user_time_delta = timedelta(minutes=NEW_USER_TOKEN_EXPIRE_MINUTES)
        new_user_token = signup_service.create_access_token(
            {"email": email, "user_role": user_role, "building_id": building_id},
            new_user_time_delta
        )

        # Generate the signup link
        signup_link = f"{SIGN_UP_LINK}?token={new_user_token}"
        print(f"Signup link for {email}: {signup_link}")

        # Optionally send the signup link via email
        email_body = f"Signup link for {email}: {signup_link}"
        email_utils.send_email(to_email=email, subject="Complete Your Signup", body=email_body)
        return {"signup_link": signup_link}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/login", response_model=schemas.Token)
def login(user: schemas.UserLogin, db: Session = Depends(database.get_db)):
    try:
        db_user = signup_service.authenticate_user(
            db, email=user.email, password=user.password)
        return db_user
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/set_password", response_model=schemas.UserCreate, description="Sets a password for the newly added user")
def set_password(token: str, new_password: str, db: Session = Depends(database.get_db)):
    try:
        # Verify the token and extract user details
        payload = signup_service.verify_token(token)
        email = payload.get("email")
        user_role = payload.get("user_role")
        building_id = payload.get("building_id")

        if not email:
            raise HTTPException(status_code=401, detail="Invalid token")

        # Check if the user already exists
        user = db.query(models.UserModel).filter(models.UserModel.email == email).first()
        if user:
            raise HTTPException(status_code=400, detail="User already exists")

        # Hash the new password and create the user
        hashed_password = signup_service.get_password_hash(new_password)
        new_user = models.UserModel(
            email=email,
            password=hashed_password,
            user_role=user_role,
            building_id=building_id
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        return {"message": "Password set successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
@router.post("/change_password", response_model=schemas.UserCreate, description="Changes the password for the user")
def change_password(token:str,old_password :str, new_password :str, db: Session = Depends(database.get_db)):
    try:
        # Verify the token and get the email
        email = signup_service.verify_token(token).get("email")
        if not email:
            raise HTTPException(status_code=401, detail="Invalid token")
        user = db.query(models.UserModel).filter(models.UserModel.email == email).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        if not signup_service.verify_password(old_password, user.password):
            raise HTTPException(status_code=401, detail="Incorrect password")
        hashed_password = signup_service.get_password_hash(new_password)
        user.password = hashed_password
        db.commit()
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("forgot_password", response_model=schemas.UserCreate, description="Sends a password reset link to the user's email")

def forgot_password(email: str, db: Session = Depends(database.get_db)):
    try:
        user = db.query(models.UserModel).filter(models.UserModel.email == email).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        new_user_time_delta = timedelta(minutes=PASSWORD_RESET_TIME)
        password_reset_token = signup_service.create_access_token({"email": email}, new_user_time_delta)
        password_reset_link= PASSWORD_RESET_LINK + f"?token={password_reset_token}"
        print(f"First time user email link token: {password_reset_link}")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/password-reset", response_model=schemas.UserCreate, description="Resets the password for the user")
def password_reset(token:str, new_password :str, db: Session = Depends(database.get_db)):
    try:
        # Verify the token and get the email
        email = signup_service.verify_token(token).get("email")
        if not email:
            raise HTTPException(status_code=401, detail="Invalid token")
        user = db.query(models.UserModel).filter(models.UserModel.email == email).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        hashed_password = signup_service.get_password_hash(new_password)
        user.password = hashed_password
        db.commit()
    except Exception as e:
        raise HTTPException(status_code=400, detail= str(e))

@router.post("/verify_token", description="Verifies the token and returns user details")
def verify_token(token: str):
    try:
        # Verify the token and extract user details
        payload = signup_service.verify_token(token)
        email = payload.get("email")
        user_role = payload.get("user_role")
        building_id = payload.get("building_id")

        if not email:
            raise HTTPException(status_code=401, detail="Invalid token")

        return {"email": email, "user_role": user_role, "building_id": building_id}
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

@router.get("/service-request/{request_id}", response_model=schemas.ServiceRequest, description="Returns request details for the given request ID")
def get_request(request_id: int, db: Session = Depends(database.get_db)):
    try:
        request = db.query(models.ServiceRequestModel).filter(models.ServiceRequestModel.request_id == request_id).first()
        if not request:
            raise HTTPException(status_code=404, detail="Request not found")
        return request
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/service-request/status/{request_id}", response_model=schemas.ServiceRequest, description="returns request status for the request id")
async def get_request_status(request_id: int, db: Session = Depends(database.get_db)):
    request = await db.query(models.ServiceRequestModel).filter(models.ServiceRequestModel.request_id == request_id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    return request.request_status


@router.delete("/service-request/{request_id}", response_model=schemas.ServiceRequest, description="deletes the request for the request id")
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


@router.post("/voice-summary", response_model=schemas.ServiceRequest, description="returns request details for input voice")
async def consume_voice_api( db: Session = Depends(database.get_db)):
    audio_path = os.path.join(AUDIO_DIR, "LG-turbowash-audio.mp3")
    
    voice_to_text = voice_service.audio_to_text(audio_path)
    print(f"Voice to Text: {voice_to_text}")
    request_details = voice_service.summarize_message(voice_to_text)
    
    # Save the request details to the database
    request_model = models.ServiceRequestModel(
        request_title=request_details["request_title"], request_desc=request_details["request_desc"], request_category=request_details["request_category"], request_date=request_details["request_date"], request_time=request_details["request_time"], request_status=request_details["request_status"]
    )
    db.add(request_model)
    db.commit()
    db.refresh(request_model)
    # Return the request details for preview
    return schemas.ServiceRequest(
        request_title=request_details["request_title"], request_desc=request_details["request_desc"], request_category=request_details["request_category"], request_date=request_details["request_date"], request_time=request_details["request_time"], request_status=request_details["request_status"]
        )
    
@router.websocket("/healthcheck")
async def healthcheck(websocket: WebSocket):
    print("websocket health check passed")


@router.websocket("/ws")
async def websocket_audio(websocket: WebSocket):
    print("connection started")
    await websocket.accept()
    recognizer = sr.Recognizer()
    audio_buffer = BytesIO()  # Buffer to accumulate audio chunks

    while True:
        try:
            # Receive raw audio data as bytes
            audio_chunk = await websocket.receive_bytes()
            print(f"Received chunk of size: {len(audio_chunk)} bytes")

            # Write the chunk to the buffer
            audio_buffer.write(audio_chunk)

            # Optional: Process the buffer when the client disconnects or after a timeout
        except Exception as e:
            print(f"Error: {e}")
            break

    # Process the accumulated audio buffer
    audio_buffer.seek(0)  # Reset the buffer pointer to the beginning
    with sr.AudioFile(audio_buffer) as source:
        audio = recognizer.record(source)

    # Convert speech to text
    transcript = voice_methods.audio_to_text(audio)
    print(f"Final transcript: {transcript}")