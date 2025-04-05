from enum import Enum


class RequestStatus(str, Enum):  # Enum compatible with both Pydantic and SQLAlchemy
    pending = "pending"
    in_progress = "in_progress"
    completed = "completed"
    cancelled = "cancelled"


class UserRole(str, Enum):  # Enum compatible with both Pydantic and SQLAlchemy
    RENTER = "RENTER"
    MANAGER = "MANAGER"
    ADMIN = "ADMIN"