from fastapi import WebSocket
import asyncio

active_connections = []

async def send_scraper_log(message: str):
    to_remove = []
    for ws in active_connections:
        try:
            await ws.send_text(str(message))
        except Exception:
            to_remove.append(ws)
    for ws in to_remove:
        if ws in active_connections:
            active_connections.remove(ws)