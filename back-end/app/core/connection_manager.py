from collections import defaultdict
from typing import DefaultDict

from fastapi import WebSocket


class ConnectionManager:
    def __init__(self) -> None:
        self.active_connections: DefaultDict[tuple[str, int], set[WebSocket]] = defaultdict(set)

    async def connect(self, websocket: WebSocket, role: str, user_id: int) -> None:
        await websocket.accept()
        self.active_connections[(role, user_id)].add(websocket)

    def disconnect(self, websocket: WebSocket, role: str, user_id: int) -> None:
        connections = self.active_connections.get((role, user_id))
        if not connections:
            return

        connections.discard(websocket)
        if not connections:
            self.active_connections.pop((role, user_id), None)

    def is_online(self, recipient_type: str, recipient_id: int) -> bool:
        return (recipient_type, recipient_id) in self.active_connections

    async def send(self, recipient_type: str, recipient_id: int, payload: dict) -> None:
        connections = list(self.active_connections.get((recipient_type, recipient_id), set()))
        for websocket in connections:
            try:
                await websocket.send_json(payload)
            except RuntimeError:
                self.disconnect(websocket, recipient_type, recipient_id)


manager = ConnectionManager()
