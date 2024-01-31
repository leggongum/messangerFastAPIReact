from pydantic import BaseModel, Field, ConfigDict
from auth.schemas import UserRead, UserSimpleRead

### Message schemas ###

class MessageBase(BaseModel):
    text: str|bytes = Field(max_length=4096)


class MessageCreate(MessageBase):
    chat_id: int


class MessageRead(MessageBase):
    id: int
    date: int
    chat_id: int
    user_id: int


class MessageUpdate(MessageBase):
    id: int


class MessageDelete(BaseModel):
    id: int


### Chat schemas ###

class ChatBase(BaseModel):
    title: str = Field(max_length=64)
    description: str = Field(None, max_length=512)


class ChatCreate(ChatBase):
    channel_id: int


class ChatSimpleRead(ChatBase):
    id: int
    created: int


class ChatRead(ChatBase):
    id: int
    created: int
    channel_id: int|None = 0

    messages: list[MessageRead] = []
    #users: list[UserSimpleRead]

    model_config = ConfigDict(arbitrary_types_allowed=True)


class ChatUpdate(ChatBase):
    id: int


class ChatDelete(BaseModel):
    id: int

### Channel schemas ###

class ChannelBase(BaseModel):
    title: str = Field(max_length=64)
    description: str = Field(None, max_length=2048)

class ChannelUser(BaseModel):
    user_id: int
    channel_id: int

class ChannelCreate(ChannelBase):
    pass


class ChannelRead(ChannelBase):
    id: int
    created: int

    users: list[UserRead] = []
    chats: list[ChatSimpleRead] = []

    model_config = ConfigDict(arbitrary_types_allowed=True)


class ChannelUpdate(ChannelBase):
    id: int


class ChannelDelete(BaseModel):
    id: int
