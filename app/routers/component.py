from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from sqlalchemy.orm import selectinload
from app.dependencies import get_session
from app.models.component import Component, ComponentLink, LinkCreate, ComponentReadWithRelationships, ComponentRead
from sqlalchemy.exc import IntegrityError

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
  
    
    # 2. Update only the fields provided in the request
    # This allows you to send JUST x_pos and y_pos without sending the name
    
    db_comp.x_pos = component_data['x_pos']
    
    db_comp.y_pos = component_data['y_pos']
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

