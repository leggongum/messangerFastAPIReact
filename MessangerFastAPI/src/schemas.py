from pydantic import BaseModel

from channel.schemas import ChannelUpdate
from auth.schemas import UserSimpleRead


class StartPage(BaseModel):
    user: UserSimpleRead
    channels: list[ChannelUpdate]