from fastapi import APIRouter, Depends
from sqlmodel import Session, select, delete
from sqlalchemy.orm import selectinload
from dependencies import get_session
from models.component import Project, ProjectRead, Component
from sqlalchemy.exc import IntegrityError
from typing import List, Optional


router = APIRouter(
    prefix="/projects",
    tags=["projects"]
)


@router.get("")
async def read_projects(session: Session = Depends(get_session)):
    res = session.exec(select(Project)).all()
    return res

@router.post("")
async def create_project(project: Project, session: Session = Depends(get_session)):
    print("creating project....")
    session.add(project)
    session.commit()
    session.refresh(project)
    return project


@router.patch("/{id}")
async def update_project(id: int, data: dict, session: Session = Depends(get_session)):
    db_task = session.get(Project, id)

    db_task.model_dump(exclude_unset=True)
    db_task.sqlmodel_update(data)

    session.add(db_task)
    session.commit()
    session.refresh(db_task)

    return db_task

@router.delete("/{id}")
async def delete_project(id: int, session: Session = Depends(get_session)):
    # statement = delete(Project).where(Project.id == id)
    component_statement = delete(Component).where(Component.project_id == id)
    session.exec(component_statement)
    
    # 2. Now it is safe to delete the parent project without foreign key conflicts
    project_statement = delete(Project).where(Project.id == id)

    session.exec(project_statement)
    session.commit()
    return {"status": "ok"}
