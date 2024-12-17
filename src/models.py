from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, String, Date, Time, Enum, DateTime
from .enums import RequestStatusEnum
from sqlalchemy.orm import relationship
from sqlalchemy import ForeignKey
import uuid
import datetime
from datetime import datetime



Base = declarative_base()

class UserModel(Base):  # SQLAlchemy model for users
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)

# class TokenModel(Base):
#     __tablename__ = "tokens"

#     id = Column(Integer, primary_key=True, index=True)
#     token = Column(String, unique=True, nullable=False, index=True)  # The token value
#     user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)  # Reference to the user
#     expires_at = Column(DateTime, nullable=False)  # Expiry time for the token
#     created_at = Column(DateTime, default=datetime.utcnow, nullable=False)  # When the token was created

#     # Optional relationship to the User model (assuming UserModel is defined in your project)
#     user = relationship("UserModel", back_populates="tokens")

#     def generate_token(self):
#         """Generate a new token value."""
#         self.token = str(uuid.uuid4())

#     def is_expired(self):
#         """Check if the token is expired."""
#         return datetime.utcnow() > self.expires_at
    
class ServiceRequestModel(Base):  # SQLAlchemy model for service requests
    __tablename__ = "service_requests"

    request_id = Column(Integer, primary_key=True, index=True)
    desc = Column(String, nullable=False)
    title = Column(String, nullable=False)
    request_date = Column(Date, nullable=False)
    request_time = Column(Time, nullable=False)
    request_status = Column(Enum(RequestStatusEnum), nullable=False)