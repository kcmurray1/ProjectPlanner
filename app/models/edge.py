from sqlmodel import Field, SQLModel, Relationship
from typing import List, Optional

class EdgeBase(SQLModel):
    source: int = Field(foreign_key="component.id", ondelete="CASCADE")
    target: int = Field(foreign_key="component.id", ondelete="CASCADE")
    sourceHandle: str 
    targetHandle: str 

class Edge(EdgeBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)


