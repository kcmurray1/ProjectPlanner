from sqlmodel import Field, SQLModel, Relationship, Column, Text
from typing import List, Optional
from enum import Enum




class ProjectBase(SQLModel):
    name: str
    description: Optional[str] = Field(default=None, sa_column=Column(Text))

    # maybe add created/last updated?

    # maybe have a template feature? Tags?
    
class Project(ProjectBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

    root_components: List["Component"] = Relationship(
        sa_relationship_kwargs={
            "primaryjoin": "and_(Project.id == Component.project_id, Component.parent_id==None)",
            "lazy": "selectin",
            "overlaps": "all_components,project"
        }
    )

    all_components: List["Component"] = Relationship(
        back_populates="project",
        sa_relationship_kwargs={
            "cascade": "all, delete-orphan",
            "lazy": "write_only",
            "overlaps": "root_components"
            }
    )

class ProjectRead(ProjectBase):
    id: int

class ComponentReadWithRelationships(ProjectRead):
    root_components: List["ComponentRead"] = []


class ComponentType(str, Enum):
    DEFAULT = "taskNode"
    GROUP = "groupNode"
    NOTE = "noteNode"
    MEDIA = "mediaNode"
    


class ComponentBase(SQLModel):
    name: str
    description: Optional[str] = Field(default=None)
    x_pos: float
    y_pos: float
    height: int
    width: int
    type: ComponentType = Field(default=ComponentType.DEFAULT)
    
    content: Optional[str] = Field(default=None)       
    file_url: Optional[str] = Field(default=None)
    file_type: Optional[str] = Field(default=None)

class Component(ComponentBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    
    project_id: int = Field(foreign_key="project.id")
    project: Optional[Project] = Relationship(back_populates="all_components", sa_relationship_kwargs={
            "overlaps": "root_components"
        })
    parent_id: Optional[int] = Field(default=None, foreign_key="component.id", ondelete="CASCADE")

    group_id: Optional[int] = Field(default=None, foreign_key="component.id", ondelete="CASCADE")
    
    group_parent: Optional["Component"] = Relationship(
        back_populates="group_children",
        sa_relationship_kwargs={
            "remote_side": "Component.id",
            "foreign_keys": "[Component.group_id]"
        }
    )

    group_children: Optional["Component"] = Relationship(
        back_populates="group_parent",
        sa_relationship_kwargs={
            "cascade": "all, delete-orphan",
            "foreign_keys": "[Component.group_id]"
        }
    )

    parent: Optional["Component"] = Relationship(
        back_populates="children", 
        sa_relationship_kwargs={
            "remote_side": "Component.id", 
            "foreign_keys": "[Component.parent_id]"
        }
    ) 

    children: List["Component"] = Relationship(
        back_populates="parent",
        sa_relationship_kwargs={
            "cascade": "all, delete-orphan",
            "foreign_keys": "[Component.parent_id]"
        }
    )

    tasks: List["Task"] = Relationship(
        back_populates="component",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )


class TaskStatus(str, Enum):
    IN_PROGRESS = "in_progress"
    NOT_STARTED = "not_started"
    COMPLETED = "completed"

class TaskBase(SQLModel):
    title: str
    description: Optional[str] = Field(default=None, sa_column=Column(Text))
    status: TaskStatus = Field(default=TaskStatus.NOT_STARTED)
    component_id: int = Field(foreign_key="component.id", ondelete="CASCADE")

class Task(TaskBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    
    # ◄ Link back to the parent component
    component: "Component" = Relationship(back_populates="tasks")

class TaskRead(TaskBase):
    id: int

class ComponentRead(ComponentBase):
    id: int

class ComponentReadWithRelationships(ComponentRead):
    children: List[ComponentRead] = []
    parent: Optional[ComponentRead] = None
    group_id: Optional[int] = None
    tasks: List[TaskRead] = []

