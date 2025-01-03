# src/auth/schemas.py

from pydantic import BaseModel
from datetime import date, time
from ..models.enums import RequestStatus
from pydantic.types import Optional


class UserCreate(BaseModel):
    email: str
    password: str


class UserLogin(BaseModel):
    email: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str

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
