# src/auth/schemas.py

from pydantic import BaseModel


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

class SummaryResponse(BaseModel):
    summary : str