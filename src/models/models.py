from sqlalchemy import Column, Date, Integer, String, Time
from sqlalchemy import Enum as SqlEnum
from sqlalchemy.ext.declarative import declarative_base

from .enums import RequestStatus, UserRole

Base = declarative_base()


class UserModel(Base):  # SQLAlchemy model for users
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=True)  # Nullable till password is set
    role = Column(SqlEnum(UserRole), nullable=False)  # Use UserRole enum
    building_id = Column(Integer, nullable=True)  # Nullable for renters

class ServiceRequestModel(Base):  # SQLAlchemy model for service requests
    __tablename__ = "service_requests"

    request_id = Column(Integer, primary_key=True, index=True)
    request_desc = Column(String, nullable=False)
    request_title = Column(String, nullable=False)
    request_date = Column(Date, nullable=False)
    request_time = Column(Time, nullable=False)
    request_category = Column(String, nullable=False)
    request_status = Column(SqlEnum(RequestStatus), nullable=True)  # Use RequestStatus enum

class UserRoleModel(Base):  # SQLAlchemy model for user roles
    __tablename__ = "user_roles"

    role_id = Column(Integer, primary_key=True, index=True)
    role_name = Column(SqlEnum(UserRole),  nullable=False)