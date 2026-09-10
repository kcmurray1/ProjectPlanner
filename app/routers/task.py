from fastapi import APIRouter, Depends
from sqlmodel import Session, select, delete
from sqlalchemy.orm import selectinload
from dependencies import get_session
from models.component import Task
from sqlalchemy.exc import IntegrityError
from typing import List, Optional


router = APIRouter(
    prefix="/tasks",
    tags=["tasks"]
)


@router.get("")
async def read_tasks(session: Session = Depends(get_session)):
    return session.exec(select(Task)).all()

@router.patch("/{id}")
async def update_task(id: int, data: dict, session: Session = Depends(get_session)):
    db_task = session.get(Task, id)

    # db_task.model_dump(exclude_unset=True)
    db_task.sqlmodel_update(data)

    session.add(db_task)
    session.commit()
    session.refresh(db_task)

    return db_task

@router.delete("/{id}")
async def delete_edge(id: int, session: Session = Depends(get_session)):
    try:
        statement = delete(Task).where(Task.id == id)
        session.exec(statement)
        session.commit()
    except Exception as e:
        session.rollback()
        print('err', e)
    
    return {"status": "ok!"}