from fastapi import APIRouter, Depends
from sqlmodel import Session, select, delete
from sqlalchemy.orm import selectinload
from app.dependencies import get_session
from app.models.component import Component, ComponentLink, LinkCreate, ComponentReadWithRelationships, ComponentRead
from sqlalchemy.exc import IntegrityError
from typing import List 

router = APIRouter(
    prefix="/components",
    tags=["components"]
)

@router.get("/")
async def read_components(session: Session = Depends(get_session)):
    return session.exec(select(Component)).all()

@router.post("/")
async def create_component(component: Component, session: Session = Depends(get_session)):
    session.add(component)
    session.commit()
    session.refresh(component)
    return component

@router.delete("/bulk-delete")
async def delete_component(ids: List[int], session: Session = Depends(get_session)):
    print('deleting components', ids)
    statement = delete(Component).where(Component.id.in_(ids))
    results = session.exec(statement)
    session.commit()
    
    return {"status": "ok!"}

@router.get("/{id}", response_model=ComponentReadWithRelationships)
async def read_component(id: int, session: Session = Depends(get_session)):
    statement = (
        select(Component)
        .where(Component.id==id)
        .options(
            selectinload(Component.children),
            selectinload(Component.parents)
        )
    )
    result = session.exec(
        statement
    ).one_or_none()

    return result

@router.patch("/{id}", response_model=ComponentRead)
async def update_component(id: int, component_data: dict, session: Session = Depends(get_session)):
    db_comp = session.get(Component, id)
    db_comp.model_dump(exclude_unset=True)
    db_comp.sqlmodel_update(component_data)

    session.add(db_comp)
    session.commit()
    session.refresh(db_comp)
    return db_comp


@router.post("/links")
async def create_link(link_data: LinkCreate, session: Session = Depends(get_session)):
    try:
        new_link = ComponentLink(parent_id=link_data.parent_id, child_id=link_data.child_id)
        session.add(new_link)
        session.commit()
    except IntegrityError:
        return {"message": "link already exists!"}

    return new_link

