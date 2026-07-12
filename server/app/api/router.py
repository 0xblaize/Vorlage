from fastapi import APIRouter

from app.api import canvas, health, slack, voice

api_router = APIRouter()
api_router.include_router(voice.router)
api_router.include_router(canvas.router)
api_router.include_router(health.router)
api_router.include_router(slack.router)