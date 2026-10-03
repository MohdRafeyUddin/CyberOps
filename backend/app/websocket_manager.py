import json
import logging
from typing import List
from fastapi import WebSocket

logger = logging.getLogger("WebSocketManager")


class ConnectionManager:
    """Manages active WebSocket connections to broadcast live network telemetry."""

    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"WebSocket client connected. Total active: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logger.info(f"WebSocket client disconnected. Total active: {len(self.active_connections)}")

    async def broadcast(self, message: dict):
        """Broadcast JSON telemetry payload to all connected clients."""
        if not self.active_connections:
            return

        payload = json.dumps(message, default=str)
        dead_connections = []

        for connection in self.active_connections:
            try:
                await connection.send_text(payload)
            except Exception as e:
                logger.debug(f"Failed to send to client: {e}")
                dead_connections.append(connection)

        for dead in dead_connections:
            self.disconnect(dead)


manager = ConnectionManager()
