from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, String, Date, Time
from .enums import RequestStatus, UserRole
from sqlalchemy import Enum as SqlEnum


Base = declarative_base()


class UserModel(Base):  # SQLAlchemy model for users
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)
    role = Column(SqlEnum(UserRole), nullable=False)  # Use UserRole enum
    
    
class ServiceRequestModel(Base):  # SQLAlchemy model for service requests
    __tablename__ = "service_requests"

    request_id = Column(Integer, primary_key=True, index=True)
    request_desc = Column(String, nullable=False)
    request_title = Column(String, nullable=False)
    request_date = Column(Date, nullable=False)
    request_time = Column(Time, nullable=False)
    request_category = Column(String, nullable=False)
    request_status = Column(SqlEnum(RequestStatus), nullable=True)  # Use RequestStatus enum
