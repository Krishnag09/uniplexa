from enum import Enum
from enum import Enum as PyEnum

class RequestStatus(str, Enum):
    pending = "pending"
    in_progress = "in_progress"
    completed = "completed"
    cancelled = "cancelled"

# Enum for SQLAlchemy models
class RequestStatusEnum(PyEnum):  
    pending = "pending"
    in_progress = "in_progress"
    completed = "completed"
    cancelled = "cancelled"
