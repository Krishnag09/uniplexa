# src/auth/schemas.py

from datetime import date, time
from typing import Optional

from pydantic import BaseModel, field_validator

from models.enums import RequestStatus, UserRole

# Password length constraints
# Note: bcrypt has a 72-byte limit, but we validate on character length for better UX
# Multi-byte characters will be truncated by the hashing function if needed
MAX_PASSWORD_LENGTH = 72
MIN_PASSWORD_LENGTH = 8


def validate_password_length(password: str) -> str:
    """Validate password length (minimum and maximum characters)"""
    if len(password) < MIN_PASSWORD_LENGTH:
        raise ValueError(f"Password must be at least {MIN_PASSWORD_LENGTH} characters long")
    
    if len(password) > MAX_PASSWORD_LENGTH:
        raise ValueError(f"Password cannot exceed {MAX_PASSWORD_LENGTH} characters")
    
    return password


class UserCreateRequest(BaseModel):
    email: str
    password: str
    role: UserRole
    building_id: Optional[int] = None  # Nullable for renters
    
    @field_validator('password')
    @classmethod
    def validate_password(cls, v: str) -> str:
        return validate_password_length(v)

class AddUserRequest(BaseModel):
    email: str
    user_role: UserRole = UserRole.renter  # Default value
    building_id: Optional[int] = None  # Optional field

class UserLoginRequest(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    """User information in response (without password)"""
    id: int
    email: str
    role: UserRole
    building_id: Optional[int] = None

class UserLoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class Dashboard(BaseModel):
    dashboardq : str

class Answer(BaseModel):
    answer : str
    
class Summary(BaseModel):
    desc : str

class ServiceRequest(BaseModel):
    request_desc : str
    request_title : str
    request_category : str
    request_date : date
    request_time : time
    request_status : RequestStatus
    

class ServiceRequestPatch(BaseModel):
    request_desc: Optional[str]
    request_title: Optional[str]
    request_date: Optional[date]
    request_time: Optional[time]
    request_status: Optional[RequestStatus]  # Use RequestStatus enum

    class Config:
        orm_mode = True

class AudioRequest(BaseModel):
    audio_path : str

class SignupLinkResponse(BaseModel):
    signup_link: str

class UserRoleResponse(BaseModel):
    user_id: int
    role: UserRole

class SetPasswordRequest(BaseModel):
    token: str  # Token sent to the user (e.g., via email)
    new_password: str
    
    @field_validator('new_password')
    @classmethod
    def validate_password(cls, v: str) -> str:
        return validate_password_length(v)