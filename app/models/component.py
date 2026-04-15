from sqlmodel import Field, SQLModel, Relationship
from typing import List, Optional

class ComponentBase(SQLModel):
    name: str
    x_pos: float
    y_pos: float
    height: int
    width: int

class Component(ComponentBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    
    parent_id: Optional[int] = Field(default=None, foreign_key="component.id", ondelete="CASCADE")
    parent: Optional["Component"] = Relationship(
        back_populates="children", 
        sa_relationship_kwargs={"remote_side": "Component.id"}
    ) 

    children: List["Component"] = Relationship(
        back_populates="parent",
        sa_relationship_kwargs={
            "cascade": "all, delete-orphan"
        }
    )

class ComponentRead(ComponentBase):
    id: int

class ComponentReadWithRelationships(ComponentRead):
    children: List[ComponentRead] = []
    parents: List[ComponentRead] = []

