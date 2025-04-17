# src/auth/exceptions.py

from fastapi import HTTPException, status

UserNotFoundException = HTTPException(
    status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
)

InvalidCredentialsException = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials"
)

EmailAlreadyRegisteredException = HTTPException(
    status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered"
)
InvalidTokenException = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token"
)

