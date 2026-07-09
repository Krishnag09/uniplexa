
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from common import database
from models import models
from schemas import schemas
from utils.utils import get_current_user_dependency
from models.enums import UserRole

router = APIRouter()

@router.get("/user_role/{user_id}", response_model=schemas.UserRoleResponse)
def get_user_role(
    user_id: int, 
    db: Session = Depends(database.get_db),
    current_user: models.UserModel = Depends(get_current_user_dependency)
):
    """
    Get user role. Users can only view their own role, unless they are admin.
    """
    try:
        # Users can only view their own role, admin can view anyone's role
        if user_id != current_user.id and current_user.role != UserRole.admin:
            raise HTTPException(status_code=403, detail="Access denied: You can only view your own role")
        
        user = db.query(models.UserModel).filter(models.UserModel.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return {"user_id": user.id, "role": user.role}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    


