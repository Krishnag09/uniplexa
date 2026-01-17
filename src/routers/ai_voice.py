import os
from io import BytesIO

import speech_recognition as sr
from fastapi import APIRouter, Depends, HTTPException, WebSocket
from sqlalchemy.orm import Session

from common import database
from config.config import config
from models import models
from schemas import schemas
from services import service_request as service
from services import voice_methods
from services import voice_methods as voice_service
from utils.utils import get_current_user_dependency

# this is static for testing purposes.
AUDIO_DIR = os.path.join(config.base_dir, "audio")
audio_path = os.path.join(AUDIO_DIR, "LG-turbowash-audio.mp3")

router = APIRouter()


@router.post("/agent/query")
def open_ai_query(
    current_user: models.UserModel = Depends(get_current_user_dependency)
):
    try:
        response = service.open_ai_query()
        return {"answer": response}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/voice-summary", response_model=schemas.ServiceRequest, description="returns request details for input voice")
async def consume_voice_api(
    building_id: int, 
    db: Session = Depends(database.get_db),
    current_user: models.UserModel = Depends(get_current_user_dependency)
):
    try:
        audio_path = os.path.join(AUDIO_DIR, "LG-turbowash-audio.mp3")
        
        voice_to_text = voice_service.audio_to_text(audio_path)
        print(f"Voice to Text: {voice_to_text}")
        request_details = voice_service.summarize_message(voice_to_text)
        
        # Save the request details to the database with user_id from token
        request_model = models.ServiceRequestModel(
            user_id=current_user.id,
            request_title=request_details["request_title"], 
            request_desc=request_details["request_desc"], 
            request_category=request_details["request_category"], 
            request_date=request_details["request_date"], 
            request_time=request_details["request_time"], 
            request_status=request_details["request_status"],
            building_id=building_id
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    db.add(request_model)
    db.commit()
    db.refresh(request_model)
    # Return the request details for preview
    return schemas.ServiceRequest(
        request_id=request_model.request_id,
        user_id=request_model.user_id,
        building_id=building_id,
        request_title=request_details["request_title"], 
        request_desc=request_details["request_desc"], 
        request_category=request_details["request_category"], 
        request_date=request_details["request_date"], 
        request_time=request_details["request_time"], 
        request_status=request_details["request_status"]
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

