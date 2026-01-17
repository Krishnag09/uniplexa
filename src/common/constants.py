# src/auth/constants.py

import os
from dotenv import load_dotenv

load_dotenv()

# User-related error messages
USER_NOT_FOUND = "User not found"
INCORRECT_PASSWORD = "Incorrect password"
EMAIL_ALREADY_EXISTS = "Email already exists"

# Token expiration times (can be overridden by environment variables)
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
NEW_USER_TOKEN_EXPIRE_MINUTES = int(os.getenv("NEW_USER_TOKEN_EXPIRE_MINUTES", "5"))
PASSWORD_RESET_TIME = int(os.getenv("PASSWORD_RESET_TIME", "5"))

# Links (can be overridden by environment variables)
SIGN_UP_LINK = os.getenv("SIGN_UP_LINK", "https://example.com/set_password")
PASSWORD_RESET_LINK = os.getenv("PASSWORD_RESET_LINK", "https://example.com/reset_password")
SIGNIN_LINK = os.getenv("SIGNIN_LINK", "https://example.com/signin")

# Note: OPENAI_API_KEY should be loaded from environment variables directly
# Do not hardcode API keys in constants or any other files