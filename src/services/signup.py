

from sqlalchemy.orm import Session
from models import models
from datetime import datetime, timedelta
from passlib.context import CryptContext
from jose import jwt
from common import exceptions
from common.constants import ACCESS_TOKEN_EXPIRE_MINUTES
from dotenv import load_dotenv
from config.config import config




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