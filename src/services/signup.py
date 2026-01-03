

from datetime import datetime, timedelta

from fastapi import HTTPException
import jwt

import bcrypt
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from common import exceptions
from common.constants import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    NEW_USER_TOKEN_EXPIRE_MINUTES,
    SIGN_UP_LINK,
)
from config.config import config
from models import models
from models.enums import UserRole

# bcrypt has a 72-byte limit on passwords
BCRYPT_MAX_PASSWORD_LENGTH = 72

def _truncate_password(password: str) -> bytes:
    """Truncate password to bcrypt's 72-byte limit and return as bytes"""
    password_bytes = password.encode("utf-8")
    if len(password_bytes) > BCRYPT_MAX_PASSWORD_LENGTH:
        return password_bytes[:BCRYPT_MAX_PASSWORD_LENGTH]
    return password_bytes

def get_password_hash(password: str) -> str:
    """Hash a password using bcrypt directly (bypassing passlib compatibility issues)"""
    # Truncate to 72 bytes before hashing
    password_bytes = _truncate_password(password)
    # Hash using bcrypt directly
    hashed_bytes = bcrypt.hashpw(password_bytes, bcrypt.gensalt())
    # Return as string for storage
    return hashed_bytes.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a hash"""
    # Truncate password to 72 bytes (same as during hashing)
    password_bytes = _truncate_password(plain_password)
    # Convert hash string back to bytes
    hashed_bytes = hashed_password.encode('utf-8')
    # Verify using bcrypt directly
    return bcrypt.checkpw(password_bytes, hashed_bytes)

def create_user(db: Session, email: str, password: str, role=None, building_id=None):
    # 1) Normalize & quick validation
    email_norm = email.strip().lower()
    if not email_norm or "@" not in email_norm:
        raise HTTPException(status_code=400, detail="Invalid email")
    
    # Validate role is provided (required field in database)
    if role is None:
        raise HTTPException(status_code=400, detail="Role is required")
    
    # Check if email already exists (before attempting insert)
    existing_user = db.query(models.UserModel).filter(models.UserModel.email == email_norm).first()
    if existing_user:
        print(f"⚠️  Email collision detected: {email_norm} (original: {email})")
        print(f"   Existing user ID: {existing_user.id}, Email: {existing_user.email}")
        raise HTTPException(status_code=409, detail="Email already registered")
    
    print(f"✅ Email {email_norm} is available, proceeding with registration")
    
    print(f"Password: {password}")
    # Enforce a sane password policy BEFORE hashing (length in characters, not bytes)
    if not isinstance(password, str) or len(password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")
    print(f"Hashing password: {password}")
    try:
        # 2) Hash
        hashed = get_password_hash(password)

        # 3) Persist - Include role and building_id (role is required!)
        new_user = models.UserModel(
            email=email_norm, 
            password=hashed,
            role=role,  # Required field!
            building_id=building_id
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return new_user

    except IntegrityError as ie:
        db.rollback()
        # Check the actual error to provide better feedback
        error_msg = str(ie.orig) if hasattr(ie, 'orig') else str(ie)
        print(f"⚠️  IntegrityError: {error_msg}")
        if "UNIQUE constraint" in error_msg or "duplicate key" in error_msg.lower():
            raise HTTPException(status_code=409, detail="Email already registered") from ie
        elif "NOT NULL constraint" in error_msg:
            raise HTTPException(status_code=400, detail=f"Missing required field: {error_msg}") from ie
        else:
            raise HTTPException(status_code=400, detail=f"Database constraint violation: {error_msg}") from ie

    except ValueError as ve:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(ve)) from ve

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Unable to create user: {str(e)}") from e

def authenticate_user(db, email: str, password: str):
    # Query the user from the database
    user = db.query(models.UserModel).filter(models.UserModel.email == email).first()

    # Check if the user exists
    if not user:
        raise exceptions.UserNotFoundException

    # Verify the password (using verify_password to ensure consistent truncation)
    if not verify_password(password, user.password):
        raise exceptions.InvalidCredentialsException

    # Generate JWT token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(data={"sub": user.email}, expires_delta=access_token_expires)
    

    # Return the token and user details
    return {"access_token": access_token, "token_type": "bearer", "user": {"id": user.id, "email": user.email, "role": user.role, "building_id": user.building_id}}

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
    user = db.query(models.UserModel).filter(models.UserModel.id == user_id).first()
    if not user:
        raise exceptions.UserNotFoundException
    return user.role

# This function is used to add a new user to the database by admin/managers
def add_user(db: Session, email: str, user_role: UserRole.renter = UserRole.renter, building_id: int = None):
    user = db.query(models.UserModel).filter(models.UserModel.email == email).first()
    data = {"email": email, "user_role": user_role, "building_id": building_id}
    if user:
        raise exceptions.EmailAlreadyRegisteredException
    new_user_time_delta = timedelta(minutes=NEW_USER_TOKEN_EXPIRE_MINUTES)
    new_user_token = create_access_token(data, new_user_time_delta)
    first_time_user_email_link_token = SIGN_UP_LINK + f"?token={new_user_token}"
    print(f"First time user email link token: {first_time_user_email_link_token}")

    return first_time_user_email_link_token

def change_password_first_time(db: Session, user_id: int, new_password: str):
    user = db.query(models.UserModel).filter(models.UserModel.id == user_id).first()
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
        payload = jwt.decode(token, config.SECRET_KEY, algorithms=["HS256"])
        return payload
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid or expired token") from e

def get_current_user(token: str, db: Session) -> models.UserModel:
    """
    Gets the current authenticated user from the JWT token.
    Requires token and database session to be provided.
    """
    try:
        # Validate and decode the token
        payload = validate_token(token)
        
        # Extract email from token (login tokens use "sub", others use "email")
        email = payload.get("sub") or payload.get("email")
        
        if not email:
            raise HTTPException(status_code=401, detail="Invalid token: missing email")
        
        # Query database for full user details
        user = db.query(models.UserModel).filter(models.UserModel.email == email).first()
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        return user
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid or expired token: {str(e)}") from e