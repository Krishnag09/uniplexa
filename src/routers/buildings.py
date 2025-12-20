from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from common import database
from models import models
from schemas import schemas
from utils.utils import get_current_user_dependency
from models.enums import UserRole

router = APIRouter()


def verify_admin_role(current_user: models.UserModel = Depends(get_current_user_dependency)):
    """Dependency to verify the current user has admin role"""
    if current_user.role != UserRole.admin:
        raise HTTPException(status_code=403, detail="Admin privileges required")
    return current_user


@router.post("/buildings", response_model=schemas.BuildingResponse, description="Create a new building (Admin only)")
def create_building(
    building: schemas.BuildingCreateRequest,
    db: Session = Depends(database.get_db),
    admin_user: models.UserModel = Depends(verify_admin_role)
):
    """Create a new building. Requires admin role."""
    try:
        # Check if building with same name already exists
        existing_building = db.query(models.BuildingModel).filter(
            models.BuildingModel.building_name == building.building_name
        ).first()
        
        if existing_building:
            raise HTTPException(status_code=400, detail="Building with this name already exists")
        
        # Create new building
        new_building = models.BuildingModel(
            building_name=building.building_name,
            building_address=building.building_address,
            building_city=building.building_city,
            building_state=building.building_state,
            building_zip=building.building_zip,
            building_country=building.building_country,
            building_latitude=building.building_latitude,
            building_longitude=building.building_longitude
        )
        
        db.add(new_building)
        db.commit()
        db.refresh(new_building)
        
        return {
            "building_id": new_building.building_id,
            "building_name": new_building.building_name,
            "building_address": new_building.building_address,
            "building_city": new_building.building_city,
            "building_state": new_building.building_state,
            "building_zip": new_building.building_zip,
            "building_country": new_building.building_country,
            "building_latitude": new_building.building_latitude,
            "building_longitude": new_building.building_longitude
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/buildings", response_model=List[schemas.BuildingResponse], description="Get all buildings")
def get_all_buildings(db: Session = Depends(database.get_db)):
    """Get all buildings. No authentication required."""
    try:
        buildings = db.query(models.BuildingModel).all()
        return [
            {
                "building_id": building.building_id,
                "building_name": building.building_name,
                "building_address": building.building_address,
                "building_city": building.building_city,
                "building_state": building.building_state,
                "building_zip": building.building_zip,
                "building_country": building.building_country,
                "building_latitude": building.building_latitude,
                "building_longitude": building.building_longitude
            }
            for building in buildings
        ]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/buildings/{building_id}", response_model=schemas.BuildingResponse, description="Get a building by ID")
def get_building(building_id: int, db: Session = Depends(database.get_db)):
    """Get a specific building by ID. No authentication required."""
    try:
        building = db.query(models.BuildingModel).filter(
            models.BuildingModel.building_id == building_id
        ).first()
        
        if not building:
            raise HTTPException(status_code=404, detail="Building not found")
        
        return {
            "building_id": building.building_id,
            "building_name": building.building_name,
            "building_address": building.building_address,
            "building_city": building.building_city,
            "building_state": building.building_state,
            "building_zip": building.building_zip,
            "building_country": building.building_country,
            "building_latitude": building.building_latitude,
            "building_longitude": building.building_longitude
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.patch("/buildings/{building_id}", response_model=schemas.BuildingResponse, description="Update a building (Admin only)")
def update_building(
    building_id: int,
    building_update: schemas.BuildingUpdateRequest,
    db: Session = Depends(database.get_db),
    admin_user: models.UserModel = Depends(verify_admin_role)
):
    """Update a building. Requires admin role."""
    try:
        building = db.query(models.BuildingModel).filter(
            models.BuildingModel.building_id == building_id
        ).first()
        
        if not building:
            raise HTTPException(status_code=404, detail="Building not found")
        
        # Update only provided fields
        update_data = building_update.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(building, key, value)
        
        db.commit()
        db.refresh(building)
        
        return {
            "building_id": building.building_id,
            "building_name": building.building_name,
            "building_address": building.building_address,
            "building_city": building.building_city,
            "building_state": building.building_state,
            "building_zip": building.building_zip,
            "building_country": building.building_country,
            "building_latitude": building.building_latitude,
            "building_longitude": building.building_longitude
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/buildings/{building_id}", description="Delete a building (Admin only)")
def delete_building(
    building_id: int,
    db: Session = Depends(database.get_db),
    admin_user: models.UserModel = Depends(verify_admin_role)
):
    """Delete a building. Requires admin role."""
    try:
        building = db.query(models.BuildingModel).filter(
            models.BuildingModel.building_id == building_id
        ).first()
        
        if not building:
            raise HTTPException(status_code=404, detail="Building not found")
        
        db.delete(building)
        db.commit()
        
        return {"message": "Building deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

