import os
from datetime import timedelta
from io import BytesIO
from typing import Optional

import speech_recognition as sr
from fastapi import APIRouter, Depends, HTTPException, WebSocket, Header
from pydantic import BaseModel
from schemas import schemas
from schemas.schemas import validate_password_length
from sqlalchemy.orm import Session
import utils
from common import database
from common.constants import PASSWORD_RESET_LINK, PASSWORD_RESET_TIME
from config.config import config
from models import models
from services import service_request as service
from services import signup, voice_methods
from services import voice_methods as voice_service
from utils import email_utils, utils
from utils.utils import get_current_user_dependency

# this is static for testing purposes.
AUDIO_DIR = os.path.join(config.base_dir, "audio")
audio_path = os.path.join(AUDIO_DIR, "LG-turbowash-audio.mp3")

# Define the signup link base URL
SIGN_UP_LINK = "https://example.com/signup"

# Define the expiration time for new user tokens
NEW_USER_TOKEN_EXPIRE_MINUTES = 30

router = APIRouter()

class SignupLinkResponse(BaseModel):
    signup_link: str

@router.get("/hello")
def read_root():
    hell0 = "Hello, World!"
    return {"message": hell0}

@router.post("/register", response_model=schemas.UserCreateRequest, description="Registers a new user")
def register(user: schemas.UserCreateRequest, db: Session = Depends(database.get_db)):
    try:
        return signup.create_user(
            db, 
            email=user.email, 
            password=user.password,
            role=user.role,  # Pass role from schema
            building_id=user.building_id  # Pass building_id from schema
        )
    except HTTPException:
        # Re-raise HTTPExceptions (like 409 for duplicate email) as-is
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    

@router.post("/add_user", response_model=None, description="Adds a new user")
def add_user(
    request: schemas.AddUserRequest,
    db: Session = Depends(database.get_db),
    # token: str = Header(None)  # Extract token from the request header
):
    try:
        # Validate the token and extract user details
        # payload = signup.validate_token(token)
        # user_role = payload.get("user_role")

        # # Check if the user has admin privileges
        # if user_role != "admin":
        #     raise HTTPException(status_code=403, detail="Admin privileges required")

        # Extract data from the request model
        email = request.email
        user_role = request.user_role
        building_id = request.building_id

        # Check if the user already exists
        user = db.query(models.UserModel).filter(models.UserModel.email == email).first()
        if user is not None:
            user_building_id = user.building_id
            if user_building_id is not None and user_building_id == building_id:
                raise HTTPException(status_code=400, detail="Email already registered for this building")

        new_user = models.UserModel(
            email=email,
            role=user_role,
            building_id=building_id
        )
        # Generate a signup token
        new_user_time_delta = timedelta(minutes=NEW_USER_TOKEN_EXPIRE_MINUTES)
        new_user_token = signup.create_access_token(
            {"email": email, "user_role": user_role, "building_id": building_id},
            new_user_time_delta
        )

        # Generate the signup link
        signup_link = f"{SIGN_UP_LINK}?token={new_user_token}"
        print(f"Signup link for {email}: {signup_link}")

        # Optionally send the signup link via email
        email_body = f"Signup link for {email}: {signup_link}"
        email_utils.send_email(to_email=email, subject="Complete Your Signup", body=email_body)
        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        # Return the response
        return {"message": "User added successfully", "signup_link": signup_link}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
@router.post("/login", response_model=schemas.UserLoginResponse)
def login(user: schemas.UserLoginRequest, db: Session = Depends(database.get_db)):
    try:
        db_user = signup.authenticate_user(
            db, email=user.email, password=user.password)
        return db_user
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/set_password", description="Sets a password for the newly added user")
def set_password(request: schemas.SetPasswordRequest, db: Session = Depends(database.get_db)):
    try:
        # Verify the token and extract user details
        payload = signup.validate_token(request.token)
        email = payload.get("email")
        user= db.query(models.UserModel).filter(models.UserModel.email == email).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found. Please complete signup first.")
        
        # Check if user already has a password set
        if user.password:
            raise HTTPException(status_code=400, detail="Password already set for this user. Use /forgot_password if you need to reset it.")
        
        # Validate password length (min and max)
        try:
            validate_password_length(request.new_password)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
        
        # Hash the new password and update the existing user
        hashed_password = signup.get_password_hash(request.new_password)
        user.password = hashed_password
        db.commit()
        db.refresh(user)

        return {"message": "Password set successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
@router.post("/change_password", response_model=schemas.UserCreateRequest, description="Changes the password for the user")
def change_password(token:str,old_password :str, new_password :str, db: Session = Depends(database.get_db)):
    try:
        token = token.split("?token=")[-1]  # Extract the token from the URL
        signup.validate_token(token)  # Validate the token
        # Verify the token and get the email
        email = signup.validate_token(token).get("email")

        if not email:
            raise HTTPException(status_code=401, detail="Invalid token")
        user = db.query(models.UserModel).filter(models.UserModel.email == email).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        if not signup.verify_password(old_password, user.password):
            raise HTTPException(status_code=401, detail="Incorrect password")

        # Validate password length (min and max)
        try:
            validate_password_length(new_password)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))

        hashed_password = signup.get_password_hash(new_password)
        user.password = hashed_password
        db.commit()
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/forgot_password", response_model=schemas.UserForgotPasswordResponse, description="Sends a password reset link to the user's email")
def forgot_password(request: schemas.UserForgotPasswordRequest, db: Session = Depends(database.get_db)):
    print(f"Forgot password request: {request}")
    try:
        print(f"Forgot password request with email : {request.email}")
        user = db.query(models.UserModel).filter(models.UserModel.email == request.email).first()
        if not user:
            raise HTTPException(status_code=404, detail=f"User not found with email: {request.email}")
        new_user_time_delta = timedelta(minutes=PASSWORD_RESET_TIME)
        password_reset_token = signup.create_access_token({"sub": user.email}, new_user_time_delta)
        password_reset_link= PASSWORD_RESET_LINK + f"?token={password_reset_token}"
        print(f"Password reset link: {password_reset_link}")
        # email_body = f"Password reset link for {request.email}: {password_reset_link}"
        # email_utils.send_email(to_email=request.email, subject="Password Reset", body=email_body)
        return {"message": "Password reset link sent to email"}
    except HTTPException:
        # Re-raise HTTPExceptions (like 404) as-is
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/password-reset", response_model=schemas.UserCreateRequest, description="Resets the password for an existing user")
def password_reset(token:str, new_password :str, db: Session = Depends(database.get_db)):
    try:
        # Verify the token and get the email
        # Handle both "sub" (from forgot_password) and "email" (for compatibility)
        payload = signup.validate_token(token)
        email = payload.get("sub") or payload.get("email")
        
        if not email:
            raise HTTPException(status_code=401, detail="Invalid token: missing email in token")
        
        user = db.query(models.UserModel).filter(models.UserModel.email == email).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Validate password length (min and max)
        try:
            validate_password_length(new_password)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
        
        hashed_password = signup.get_password_hash(new_password)
        user.password = hashed_password
        db.commit()
        db.refresh(user)
        
        return {"message": "Password reset successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/verify_token", description="Verifies the token and returns token payload details")
def verify_token(token: str, db: Session = Depends(database.get_db)):
    try:
        # Verify the token and return the decoded payload
        user = signup.get_current_user(token=str(token), db=db)
        return {
            "id": user.id,
            "email": user.email,
            "role": user.role,
            "building_id": user.building_id
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/me", response_model=schemas.UserResponse, description="Get current authenticated user details")
def get_current_user_info(current_user: models.UserModel = Depends(get_current_user_dependency)):
    """
    Get the current authenticated user's information.
    Requires valid JWT token in Authorization header: 'Bearer <token>'
    """
    return {
        "id": current_user.id,
        "email": current_user.email,
        "role": current_user.role,
        "building_id": current_user.building_id
    }

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
        request_description = request.desc
        request_title = utils.summarize_request(request_description)
        request_category = utils.detect_category(request_description)
        request_date_time = utils.get_date_time()
        request_status = schemas.RequestStatus.pending
        
        request_model = models.ServiceRequestModel(
            request_desc=request_description, 
            request_title=request_title, 
            request_date=request_date_time["date"], 
            request_time=request_date_time["time"], 
            request_category=request_category,
            request_status=request_status
        )

        db.add(request_model)
        db.commit()
        db.refresh(request_model)
        return {
            "request_id": request_model.request_id, 
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
    db.delete(request)
    db.commit()
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