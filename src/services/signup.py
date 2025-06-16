

from sqlalchemy.orm import Session
from models import models
from datetime import datetime, timedelta
from passlib.context import CryptContext
from jose import jwt
from common import exceptions
from common.constants import ACCESS_TOKEN_EXPIRE_MINUTES, NEW_USER_TOKEN_EXPIRE_MINUTES, SIGN_UP_LINK
from config.config import config
from models.enums import UserRole
from jose import JWTError
from fastapi import HTTPException


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password):
    return pwd_context.hash(password)

def create_user(db: Session, email: str, password: str):
    user = db.query(models.UserModel).filter(models.UserModel.email == email).first()
    if user:
        raise exceptions.EmailAlreadyRegisteredException

    hashed_password = get_password_hash(password)
    new_user = models.UserModel(email=email, password=hashed_password)
    user = db.query(models.UserModel).filter(models.UserModel.email == email).first()
    db.commit()
    db.refresh(new_user)
    return new_user


def authenticate_user(db, email: str, password: str):
    # Query the user from the database
    user = db.query(models.UserModel).filter(models.UserModel.email == email).first()

    # Check if the user exists
    if not user:
        raise exceptions.UserNotFoundException

    # Verify the password
    if not pwd_context.verify(password, user.password):
        raise exceptions.InvalidCredentialsException

    # Generate JWT token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(data={"sub": user.email}, expires_delta=access_token_expires)

    # Return the token and user details
    return {"access_token": access_token, "token_type": "bearer", "user": {"id": user.user_id, "email": user.email}}

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    # Add expiration time to the token
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)  # Default expiration time
    to_encode.update({"exp": expire})

    # Encode the token
    print(f'Encoding JWT with data: {config.ALGORITHM}')
    encoded_jwt = jwt.encode(to_encode, config.SECRET_KEY, algorithm=config.ALGORITHM)  
    return encoded_jwt

def decode_jwt(token: str): 
    try:
        payload = jwt.decode(token, config.SECRET_KEY, algorithms=[config.ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise exceptions.TokenExpiredException
    except jwt.JWTError:
        raise exceptions.InvalidTokenException
    
def check_permissions(user_role: str, required_role: str):
    if user_role != required_role:
        raise exceptions.PermissionDeniedException
    return True

def get_user_role(db: Session, user_id: int):
    user = db.query(models.UserModel).filter(models.UserModel.user_id == user_id).first()
    if not user:
        raise exceptions.UserNotFoundException
    return user.role

# This function is used to add a new user to the database by admin/managers
def add_user(db: Session, email: str, user_role: UserRole.renter = UserRole.renter, building_id: int = None):
    user = db.query(models.UserModel).filter(models.UserModel.email == email).first()
    data = {email: email, user_role: user_role, building_id: building_id}
    if user:
        raise exceptions.EmailAlreadyRegisteredException
    new_user_time_delta = timedelta(minutes=NEW_USER_TOKEN_EXPIRE_MINUTES)
    new_user_token = create_access_token(data, new_user_time_delta)
    first_time_user_email_link_token = SIGN_UP_LINK + f"?token={new_user_token}"
    print(f"First time user email link token: {first_time_user_email_link_token}")

    return first_time_user_email_link_token

def change_password_first_time(db: Session, user_id: int, new_password: str):
    user = db.query(models.UserModel).filter(models.UserModel.user_id == user_id).first()
    if not user:
        raise exceptions.UserNotFoundException

    hashed_password = get_password_hash(new_password)
    user.password = hashed_password
    db.commit()
    db.refresh(user)
    return user

def validate_token(token: str):
    """
    Validates the token and returns the decoded payload.
    Raises an HTTPException if the token is invalid or expired.
    """
    try:
        # Decode and validate the token
        payload = jwt.decode(token, config.SECRET_KEY, algorithms=[config.ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")