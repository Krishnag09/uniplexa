

from sqlalchemy.orm import Session
from models import models
from datetime import datetime, timedelta
from passlib.context import CryptContext
from jose import jwt
from config.config import config
from common import exceptions


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
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


def authenticate_user(db: Session, email: str, password: str):
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        raise exceptions.UserNotFoundException

    if not verify_password(password, user.hashed_password):
        raise exceptions.InvalidCredentialsException

    return user





def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, config.get("SECRET_KEY"), algorithm=config.get("ALGORITHM"))