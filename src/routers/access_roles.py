

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from common import database
from models import models
from schemas import schemas

router = APIRouter()
@router.get("/user_role/{user_id}", response_model=schemas.UserRoleResponse)
def get_user_role(user_id: int, db: Session = Depends(database.get_db)):
    try:
        user = db.query(models.UserModel).filter(models.UserModel.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return {"user_id": user.id, "role": user.role}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    


