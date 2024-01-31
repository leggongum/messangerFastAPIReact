from pydantic import EmailStr, Field, BaseModel
from fastapi_users import schemas

from typing import Optional


class UserSimpleRead(BaseModel):
    id: int
    username: str
    email: EmailStr
    created: int


class UserRead(schemas.BaseUser[int]):
    id: int
    username: str
    email: EmailStr
    created: int
    is_active: bool = True
    is_superuser: bool = False
    is_verified: bool = False


class UserCreate(schemas.BaseUserCreate):
    username: str
    email: EmailStr
    password: str
    created: int 
    is_active: Optional[bool] = True
    is_superuser: Optional[bool] = False
    is_verified: Optional[bool] = False


class UserUpdate(schemas.BaseUserUpdate):
    username: Optional[str] = None
    pass
