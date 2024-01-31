from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.responses import HTMLResponse
from starlette.websockets import WebSocket, WebSocketDisconnect

from time import time

from crypto.crypt_fernet import encrypt
from websocket.connection_manager import get_manager
from websocket.utils import get_user_from_cookie
from models import User, Message, Channel, Chat
from database import get_session


router = APIRouter(
    prefix='/ws',
    tags=['WS'],
)

html = """
<!DOCTYPE html>
<html>
    <head>
        <title>Chat</title>
    </head>
    <body>
        <h1>WebSocket Chat</h1>
        <h2>Your Chat: <span id="ws-id"></span></h2>
        <form action="" onsubmit="sendMessage(event)">
            <input type="text" id="messageText" autocomplete="off"/>
            <button>Send</button>
        </form>
        <ul id='messages'>
        </ul>
        <script>
            var chat_id = 2
            document.querySelector("#ws-id").textContent = chat_id;
            var ws = new WebSocket(`ws://messangerfastapireact.leggongum.repl.co/ws/${chat_id}`);
            ws.onmessage = function(event) {
                var messages = document.getElementById('messages')
                var message = document.createElement('li')
                var content = document.createTextNode(event.data)
                message.appendChild(content)
                messages.appendChild(message)
            };
            function sendMessage(event) {
                var input = document.getElementById("messageText")
                ws.send(input.value)
                input.value = ''
                event.preventDefault()
            }
        </script>
    </body>
</html>
"""


@router.get("/")
async def get():
    return HTMLResponse(html)


async def user_chat_permission(user: User, session: AsyncSession, chat_id: int) -> tuple[bool, bool]:
    chat = await session.get(Chat, chat_id)
    if chat.channel_id:
        channel = await session.get(Channel, chat.channel_id)
        return channel in user.channels, False
    return chat in user.privatechats, True


async def create_message(chat_id: int, text: bytes, user_id: int, session: AsyncSession):
    date = round(time())
    new_message = Message(text=encrypt(text), date=date, chat_id=chat_id, user_id=user_id)
    session.add(new_message)
    await session.commit()
    return new_message.id, date


@router.websocket("/{chat_id}")
async def websocket_chat(websocket: WebSocket,
                         chat_id: int,
                         user: User = Depends(get_user_from_cookie),
                         session: AsyncSession = Depends(get_session),
                         manager=Depends(get_manager)
                         ):
    can_user_send_message, isPrivate = await user_chat_permission(user, session, chat_id)
    
    if not can_user_send_message:
        raise WebSocketDisconnect(code=403, reason="You can't use this chat!")

    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_bytes()
            message_id, date = await create_message(chat_id, data, user.id, session)
            await manager.send_message_in_chat({'id': message_id, 'user_id': user.id, 'text':  data.decode('iso-8859-1') if isPrivate else data.decode('utf8'), 'date': date, 'chat_id': chat_id})
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        print(f"{user.username} left the chat")
