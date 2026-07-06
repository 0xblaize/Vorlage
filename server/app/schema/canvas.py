from datetime import datetime

from pydantic import BaseModel

from app.schema.voice import GraphUpdate


class CanvasCreate(BaseModel):
    name: str
    graph: GraphUpdate


class CanvasRead(BaseModel):
    id: int
    name: str
    graph: GraphUpdate
    created_at: datetime
