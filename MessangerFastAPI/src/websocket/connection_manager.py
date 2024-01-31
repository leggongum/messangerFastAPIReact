from starlette.websockets import WebSocket


class ConnectionManager:
    current_active_chats = {}

    def __init__(self, chat_id: int):
        self.chat_id = chat_id
        self.active_connections: list[WebSocket] = []
        ConnectionManager.current_active_chats[chat_id] = self
        print(ConnectionManager.current_active_chats)

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def get_message_back(self, message: bytes, websocket: WebSocket):
        await websocket.send_bytes(message)

    async def send_message_in_chat(self, message: dict):
        for connection in self.active_connections:
            await connection.send_json(message)


def get_manager(chat_id: int):
    if chat_id in ConnectionManager.current_active_chats:
        return ConnectionManager.current_active_chats[chat_id]
    return ConnectionManager(chat_id)