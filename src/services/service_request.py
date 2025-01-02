# src/auth/service.py

import os
import openai
from dotenv import load_dotenv
from sqlalchemy.orm import Session
from openai import OpenAI
from ..utils import utils
from .. import exceptions, models

load_dotenv()

openai.api_key = os.getenv("OPENAI_API_KEY")

client = OpenAI()


def create_user(db: Session, email: str, password: str):
    user = db.query(models.User).filter(models.User.email == email).first()
    if user:
        raise exceptions.EmailAlreadyRegisteredException

    hashed_password = utils.get_password_hash(password)
    new_user = models.User(email=email, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


def authenticate_user(db: Session, email: str, password: str):
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        raise exceptions.UserNotFoundException

    if not utils.verify_password(password, user.hashed_password):
        raise exceptions.InvalidCredentialsException

    return user

def basic_query(db: Session, query: str):
    return db.execute(query).fetchall()

def open_ai_query():
    completion = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {
                "role": "user",
                "content": "Write a haiku about recursion in programming."
            }
        ]
    )

    print(completion.choices[0].message)
    
def open_ai_query_with_agent(query: str):
    completion = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role":"agent", "content": "what would you like me to do?"},
            {
                "role": "user",
                "content": query
            }
        ]
        
    )

    return completion.choices[0].message

