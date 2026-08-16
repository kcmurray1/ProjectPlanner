from fastapi import APIRouter, Depends
from sqlmodel import Session, select, delete
from sqlalchemy.orm import selectinload
from dependencies import get_session
from models.edge import Edge
from sqlalchemy.exc import IntegrityError
from typing import List 

router = APIRouter(
    prefix="/edges",
    tags=["edges"]
)


@router.get("")
async def read_edges(session: Session = Depends(get_session)):
    return session.exec(select(Edge)).all()

@router.post("")
async def create_edge(edge: Edge, session: Session = Depends(get_session)):
    print('creating',edge)
    session.add(edge)
    session.commit()
    session.refresh(edge)
    return edge

@router.delete("/bulk-delete")
async def delete_edge(ids: List[int], session: Session = Depends(get_session)):
    if not ids:
        return {"status": "skipped"}
    try:
        statement = delete(Edge).where(Edge.id.in_(ids))
        results = session.exec(statement)
        session.commit()
    except Exception as e:
        session.rollback()
        print('err', e)
    
    return {"status": "ok!"}

