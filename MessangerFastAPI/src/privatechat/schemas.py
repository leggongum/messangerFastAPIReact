from pydantic import BaseModel, Field, ConfigDict

from auth.schemas import UserRead


class PublicKeyCreate(BaseModel):
    e: int
    n: int

class PublicKeyRead(BaseModel):
    e: str
    n: str

class PrivateMessageRead(BaseModel):
    id: int
    text: bytes
    user_id: int
    date: int


class PrivateChatBase(BaseModel):
    title: str = Field(max_length=64)
    description: str = Field(None, max_length=512)


class PrivateChatCreate(PrivateChatBase):
    pass


class PrivateChatRead(PrivateChatBase):
    id: int
    created: int

    users: list[UserRead]
    messages: list[PrivateMessageRead]


class PrivateChatSimpleRead(PrivateChatBase):
    id: int
    created: int


class PrivateChatUpdate(PrivateChatBase):
    id: int


class PrivateChatsAsObj(BaseModel):
    chats: list[PrivateChatSimpleRead]
