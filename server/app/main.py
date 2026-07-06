from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables if the DB is reachable; canvas routes 503 otherwise.
    try:
        from app.model import canvas  # noqa: F401 — register models
        from app.model.base import Base, engine

        Base.metadata.create_all(engine)
    except Exception as exc:
        print(f"WARNING: database unavailable, canvas persistence disabled: {exc}")
    yield


app = FastAPI(title="Vorlage", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def vorlage():
    return "Welcome to Vorlage Server"


app.include_router(api_router)