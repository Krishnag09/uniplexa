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
    """Create a new building. Requires admin role.
    If place_id is provided, will fetch building details from Google Places API.
    Otherwise, requires all building fields to be provided.
    """
    try:
        import requests
        from config.config import config
        
        building_name = building.building_name
        building_address = building.building_address
        building_city = building.building_city
        building_state = building.building_state
        building_zip = building.building_zip
        building_country = building.building_country or "USA"
        building_latitude = building.building_latitude
        building_longitude = building.building_longitude
        place_id = building.place_id
        
        # If place_id is provided, fetch details from Google Places API
        if place_id:
            # Check if building with same place_id already exists
            existing_building = db.query(models.BuildingModel).filter(
                models.BuildingModel.place_id == place_id
            ).first()
            
            if existing_building:
                raise HTTPException(status_code=400, detail="Building with this place_id already exists")
            
            # Fetch place details from Google Places API
            google_api_key = config.get("GOOGLE_MAPS_API_KEY")
            if not google_api_key:
                raise HTTPException(status_code=500, detail="Google Maps API key not configured")
            
            try:
                places_url = "https://maps.googleapis.com/maps/api/place/details/json"
                params = {
                    "place_id": place_id,
                    "fields": "name,formatted_address,address_components,geometry",
                    "key": google_api_key
                }
                
                response = requests.get(places_url, params=params)
                response.raise_for_status()
                data = response.json()
                
                if data.get("status") != "OK" or not data.get("result"):
                    raise HTTPException(status_code=400, detail=f"Failed to fetch place details: {data.get('status')}")
                
                result = data["result"]
                
                # Extract address components
                address_components = result.get("address_components", [])
                address_dict = {}
                for component in address_components:
                    types = component.get("types", [])
                    if "street_number" in types:
                        address_dict["street_number"] = component.get("long_name", "")
                    elif "route" in types:
                        address_dict["route"] = component.get("long_name", "")
                    elif "locality" in types:
                        address_dict["city"] = component.get("long_name", "")
                    elif "administrative_area_level_1" in types:
                        address_dict["state"] = component.get("short_name", "")
                    elif "postal_code" in types:
                        address_dict["zip"] = component.get("long_name", "")
                    elif "country" in types:
                        address_dict["country"] = component.get("short_name", "")
                
                # Extract geometry
                geometry = result.get("geometry", {})
                location = geometry.get("location", {})
                
                # Populate fields from Google Places API
                building_name = result.get("name", building_name or "")
                street_number = address_dict.get("street_number", "")
                route = address_dict.get("route", "")
                building_address = f"{street_number} {route}".strip() or result.get("formatted_address", "").split(",")[0]
                building_city = address_dict.get("city", "")
                building_state = address_dict.get("state", "")
                building_zip = address_dict.get("zip", "")
                building_country = address_dict.get("country", building_country)
                building_latitude = location.get("lat", 0.0)
                building_longitude = location.get("lng", 0.0)
                
            except requests.RequestException as e:
                raise HTTPException(status_code=400, detail=f"Error fetching place details from Google: {str(e)}")
        
        # Validate required fields (if place_id not provided, all fields are required)
        if not place_id:
            if not all([building_name, building_address, building_city, building_state, building_zip]):
                raise HTTPException(status_code=400, detail="All building fields are required when place_id is not provided")
            if building_latitude is None or building_longitude is None:
                raise HTTPException(status_code=400, detail="Latitude and longitude are required when place_id is not provided")
        
        # Check if building with same name already exists (if name provided)
        if building_name:
            existing_building = db.query(models.BuildingModel).filter(
                models.BuildingModel.building_name == building_name
            ).first()
            
            if existing_building:
                raise HTTPException(status_code=400, detail="Building with this name already exists")
        
        # Create new building
        new_building = models.BuildingModel(
            place_id=place_id,
            building_name=building_name,
            building_address=building_address,
            building_city=building_city,
            building_state=building_state,
            building_zip=building_zip,
            building_country=building_country,
            building_latitude=building_latitude or 0.0,
            building_longitude=building_longitude or 0.0
        )
        
        db.add(new_building)
        db.commit()
        db.refresh(new_building)
        
        return {
            "building_id": new_building.building_id,
            "place_id": new_building.place_id,
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
            "place_id": building.place_id,
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
            "place_id": building.place_id,
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

