from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from common import database
from common.constants import PASSWORD_RESET_LINK, PASSWORD_RESET_TIME
from models import models
from schemas import schemas
from schemas.schemas import validate_password_length
from services import signup
from utils.utils import get_current_user_dependency

# Define the signup link base URL
SIGN_UP_LINK = "https://example.com/signup"

# Define the expiration time for new user tokens
NEW_USER_TOKEN_EXPIRE_MINUTES = 30

router = APIRouter()


@router.post("/register", response_model=schemas.UserCreateRequest, description="Registers a new user")
def register(user: schemas.UserCreateRequest, db: Session = Depends(database.get_db)):
    try:
        return signup.create_user(
            db, 
            email=user.email, 
            password=user.password,
            role=user.role,
            building_id=user.building_id
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/add_user", response_model=None, description="Adds a new user")
def add_user(
    request: schemas.AddUserRequest,
    db: Session = Depends(database.get_db),
):
    try:
        # Extract data from the request model
        email = request.email
        user_role = request.user_role
        building_id = request.building_id

        # Check if the user already exists
        user = db.query(models.UserModel).filter(models.UserModel.email == email).first()
        if user is not None:
            user_building_id = user.building_id
            if user_building_id is not None and user_building_id == building_id:
                raise HTTPException(status_code=400, detail="Email already registered for this building")

        new_user = models.UserModel(
            email=email,
            role=user_role,
            building_id=building_id
        )
        # Generate a signup token
        new_user_time_delta = timedelta(minutes=NEW_USER_TOKEN_EXPIRE_MINUTES)
        new_user_token = signup.create_access_token(
            {"email": email, "user_role": user_role, "building_id": building_id},
            new_user_time_delta
        )

        # Generate the signup link
        signup_link = f"{SIGN_UP_LINK}?token={new_user_token}"
        print(f"Signup link for {email}: {signup_link}")

        # Optionally send the signup link via email
        # email_body = f"Signup link for {email}: {signup_link}"
        # email_utils.send_email(to_email=email, subject="Complete Your Signup", body=email_body)
        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        # Return the response
        return {"message": "User added successfully", "signup_link": signup_link}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/login", response_model=schemas.UserLoginResponse)
def login(user: schemas.UserLoginRequest, db: Session = Depends(database.get_db)):
    try:
        print(f"Login attempt for email: {user.email}")
        db_user = signup.authenticate_user(
            db, email=user.email, password=user.password)
        print(f"Login successful for email: {user.email}")
        return db_user
    except HTTPException as he:
        # Re-raise HTTPExceptions as-is (they already have proper status codes)
        print(f"Login failed for email {user.email}: {he.detail} (status: {he.status_code})")
        raise
    except Exception as e:
        # Log the full exception for debugging
        print(f"Login error for email {user.email}: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/set_password", description="Sets a password for the newly added user")
def set_password(request: schemas.SetPasswordRequest, db: Session = Depends(database.get_db)):
    try:
        # Verify the token and extract user details
        payload = signup.validate_token(request.token)
        email = payload.get("email")
        user = db.query(models.UserModel).filter(models.UserModel.email == email).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found. Please complete signup first.")
        
        # Check if user already has a password set
        if user.password:
            raise HTTPException(status_code=400, detail="Password already set for this user. Use /forgot_password if you need to reset it.")
        
        # Validate password length (min and max)
        try:
            validate_password_length(request.new_password)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
        
        # Hash the new password and update the existing user
        hashed_password = signup.get_password_hash(request.new_password)
        user.password = hashed_password
        db.commit()
        db.refresh(user)

        return {"message": "Password set successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/change_password", response_model=schemas.UserCreateRequest, description="Changes the password for the user")
def change_password(token: str, old_password: str, new_password: str, db: Session = Depends(database.get_db)):
    try:
        token = token.split("?token=")[-1]  # Extract the token from the URL
        signup.validate_token(token)  # Validate the token
        # Verify the token and get the email
        email = signup.validate_token(token).get("email")

        if not email:
            raise HTTPException(status_code=401, detail="Invalid token")
        user = db.query(models.UserModel).filter(models.UserModel.email == email).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        if not signup.verify_password(old_password, user.password):
            raise HTTPException(status_code=401, detail="Incorrect password")

        # Validate password length (min and max)
        try:
            validate_password_length(new_password)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))

        hashed_password = signup.get_password_hash(new_password)
        user.password = hashed_password
        db.commit()
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/forgot_password", response_model=schemas.UserForgotPasswordResponse, description="Sends a password reset link to the user's email")
def forgot_password(request: schemas.UserForgotPasswordRequest, db: Session = Depends(database.get_db)):
    print(f"Forgot password request: {request}")
    try:
        print(f"Forgot password request with email : {request.email}")
        user = db.query(models.UserModel).filter(models.UserModel.email == request.email).first()
        if not user:
            raise HTTPException(status_code=404, detail=f"User not found with email: {request.email}")
        new_user_time_delta = timedelta(minutes=PASSWORD_RESET_TIME)
        password_reset_token = signup.create_access_token({"sub": user.email}, new_user_time_delta)
        password_reset_link = PASSWORD_RESET_LINK + f"?token={password_reset_token}"
        print(f"Password reset link: {password_reset_link}")
        # email_body = f"Password reset link for {request.email}: {password_reset_link}"
        # email_utils.send_email(to_email=request.email, subject="Password Reset", body=email_body)
        return {"message": "Password reset link sent to email"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/password-reset", response_model=schemas.UserCreateRequest, description="Resets the password for an existing user")
def password_reset(token: str, new_password: str, db: Session = Depends(database.get_db)):
    try:
        # Verify the token and get the email
        # Handle both "sub" (from forgot_password) and "email" (for compatibility)
        payload = signup.validate_token(token)
        email = payload.get("sub") or payload.get("email")
        
        if not email:
            raise HTTPException(status_code=401, detail="Invalid token: missing email in token")
        
        user = db.query(models.UserModel).filter(models.UserModel.email == email).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Validate password length (min and max)
        try:
            validate_password_length(new_password)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
        
        hashed_password = signup.get_password_hash(new_password)
        user.password = hashed_password
        db.commit()
        db.refresh(user)
        
        return {"message": "Password reset successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/verify_token", description="Verifies the token and returns token payload details")
def verify_token(token: str, db: Session = Depends(database.get_db)):
    try:
        # Verify the token and return the decoded payload
        user = signup.get_current_user(token=str(token), db=db)
        return {
            "id": user.id,
            "email": user.email,
            "role": user.role,
            "building_id": user.building_id
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/me", response_model=schemas.UserResponse, description="Get current authenticated user details")
def get_current_user_info(current_user: models.UserModel = Depends(get_current_user_dependency)):
    """
    Get the current authenticated user's information.
    Requires valid JWT token in Authorization header: 'Bearer <token>'
    """
    return {
        "id": current_user.id,
        "email": current_user.email,
        "role": current_user.role,
        "building_id": current_user.building_id
    }

