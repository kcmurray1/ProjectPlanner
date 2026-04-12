from sqlmodel import Field, SQLModel, Relationship
from typing import List, Optional


class LinkCreate(SQLModel):
    parent_id: int
    child_id: int


class ComponentLink(SQLModel, table=True):
    parent_id: int = Field(foreign_key="component.id", primary_key=True)
    child_id: int = Field(foreign_key="component.id", primary_key=True)

class ComponentBase(SQLModel):
    name: str
    x_pos: float
    y_pos: float
    height: int
    width: int

class Component(ComponentBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
   
    parents: List["Component"] = Relationship(
        link_model=ComponentLink,
        back_populates="children", 
        sa_relationship_kwargs={
            "primaryjoin": "Component.id==ComponentLink.child_id",
            "secondaryjoin": "Component.id==ComponentLink.parent_id"
        }
    ) 

    children: List["Component"] = Relationship(
        link_model=ComponentLink,
        back_populates="parents",
          sa_relationship_kwargs={
            "primaryjoin": "Component.id==ComponentLink.parent_id",
            "secondaryjoin": "Component.id==ComponentLink.child_id"
        }
    )

class ComponentRead(ComponentBase):
    id: int

class ComponentReadWithRelationships(ComponentRead):
    children: List[ComponentRead] = []
    parents: List[ComponentRead] = []

