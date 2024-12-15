# src/auth/schemas.py

from pydantic import BaseModel
import date 


class UserCreate(BaseModel):
    email: str
    password: str


class UserLogin(BaseModel):
    email: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str

class ServiceRequest(BaseModel):
    desc: str
    title: str
    date : str
    