
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



router = APIRouter()
@router.get("/user_role/{user_id}", response_model=schemas.UserRoleResponse)
def get_user_role(user_id: int, db: Session = Depends(database.get_db)):
    try:
        user = db.query(models.UserModel).filter(models.UserModel.user_id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return {"user_id": user.user_id, "role": user.role}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    


