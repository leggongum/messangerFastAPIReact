from fastapi import Depends
from starlette.exceptions import WebSocketException
from starlette.websockets import WebSocket

from auth.manager import get_user_manager
from auth.transport_strategy import get_jwt_strategy


async def get_user_from_cookie(websocket: WebSocket, user_manager=Depends(get_user_manager)):
    cookie = websocket.cookies.get("fastapiusersauth")
    user = await get_jwt_strategy().read_token(cookie, user_manager)
    if not user or not user.is_active:
        raise WebSocketException("Invalid user")
    yield user