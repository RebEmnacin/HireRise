"""Shapes of the data going in and out of the API (validated by Pydantic)."""
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class ORM(BaseModel):
    # lets Pydantic read straight from SQLAlchemy objects
    model_config = ConfigDict(from_attributes=True)


class EmployeeBrief(ORM):
    id: int
    employee_no: str
    first_name: str
    last_name: str
    position: Optional[str] = None
    status: str


class UserOut(ORM):
    id: int
    email: EmailStr
    role: str
    is_active: bool
    employee: Optional[EmployeeBrief] = None  # admins may not have an HR record


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class ChangePasswordIn(BaseModel):
    current_password: str
    new_password: str = Field(min_length=8, max_length=128)
