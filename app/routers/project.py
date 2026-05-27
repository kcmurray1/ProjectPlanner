from fastapi import APIRouter, Depends
from sqlmodel import Session, select, delete
from sqlalchemy.orm import selectinload
from app.dependencies import get_session
from app.models.component import Project
from sqlalchemy.exc import IntegrityError
from typing import List, Optional


router = APIRouter(
    prefix="/projects",
    tags=["projects"]
)


@router.get("/")
async def read_tasks(session: Session = Depends(get_session)):
    return session.exec(select(Project)).all()

@router.post("/")
async def create_component(project: Project, session: Session = Depends(get_session)):
    print(project)
    session.add(project)
    session.commit()
    session.refresh(project)
    return project


@router.patch("/{id}")
async def update_task(id: int, data: dict, session: Session = Depends(get_session)):
    db_task = session.get(Project, id)

    db_task.model_dump(exclude_unset=True)
    db_task.sqlmodel_update(data)

    session.add(db_task)
    session.commit()
    session.refresh(db_task)

    return db_task
