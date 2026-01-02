# src/auth/utils.py

import os
from datetime import datetime
from typing import Optional

import openai
from dotenv import load_dotenv
from fastapi import Depends, HTTPException, Header
from jose import JWTError
from sqlalchemy.orm import Session

from common import database
from services import signup

# Load environment variables from .env file
load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")


def display_menu():
    print("\n What would you like to do?")
    print("1. Log a service request")
    print("2. Check the status of a service request")
    print("3. Book an amenity")
    print("4. Access a document")
    print("5. Look up a policy")
    choice = input("Enter your choice: ")
    return choice

def add_context_from_menu(choice):
    if choice == "1":
        return "Describe the issue you are experiencing"
    elif choice == "2":
        return "What was the service request about?"
    elif choice == "3":
        return "What amenity would you like to book?"
    elif choice == "4":
        return "What document would you like to access?"
    elif choice == "5":
        return "What policy would you like to look up?"
    else:
        return "Invalid choice. Please try again."

def summarize_request(request_text):
    res = openai.chat.completions.create(
        model="gpt-4",
        messages=[
            {
                "role": "system",
                "content": "You are an assistant that summarizes text into a concise description of less than 25 words.",
            },
            {"role": "user", "content": f"Summarize the following request: {request_text}"},
        ],
    )
    summary_text = res.choices[0].message.content
    print(f"Summary: {res.choices[0].message.content}")
    print(res.choices[0].message.content)
    
    return summary_text

def detect_category(request_text):
    res = openai.chat.completions.create(
        model="gpt-4",
        messages=[
            {
                "role": "system",
                "content": "You are an assistant that categorizes text into one of the following categories: service request, amenity booking, document access, policy lookup.",
            },
            {"role": "user", "content": f"Detect the category of the following request: {request_text}"},
        ],
    )
    category = res.choices[0].message.content
    print(f"Category: {res.choices[0].message.content}")
    return category

def get_date_time():
    now = datetime.now()
    current_date = now.date()  # Returns a `date` object
    current_time = now.time()  # Returns a `time` object
    # current_time = current_time.strftime("%H:%M:%S")
    return {"date": current_date, "time": current_time}


def get_current_user_dependency(authorization: Optional[str] = Header(None), db: Session = Depends(database.get_db)):
    """
    Dependency to extract and validate JWT token from Authorization header.
    Returns the current authenticated user.
    Can be used as a FastAPI dependency in protected endpoints.
    """
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")
    
    # Extract token from "Bearer <token>" format
    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise HTTPException(status_code=401, detail="Invalid authentication scheme. Use 'Bearer'")
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid Authorization header format. Use 'Bearer <token>'")
    
    # Get current user from token
    return signup.get_current_user(token=token, db=db)

def admin_role_dependency(token: str = Depends(signup.get_user_role)):
    """
    Dependency to validate if the current user has the 'admin' role.
    """
    try:
        # Decode the token and extract user details
        payload = signup.verify_token(token)
        user_role = payload.get("user_role")
        if user_role != "admin":
            return False
        else:
            return True
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")