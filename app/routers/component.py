from fastapi import APIRouter, Depends
from sqlmodel import Session, select, delete
from sqlalchemy.orm import selectinload
from app.dependencies import get_session
from app.models.component import Component, ComponentReadWithRelationships, ComponentRead
from app.models.edge import Edge
from sqlalchemy.exc import IntegrityError
from typing import List, Optional
router = APIRouter(
    prefix="/components",
    tags=["components"]
)

@router.get("/")
async def read_components(session: Session = Depends(get_session)):
    return session.exec(select(Component)).all()

@router.post("/")
async def create_component(component: Component, session: Session = Depends(get_session)):

    if component.parent_id == 0:
        component.parent_id = None
    print(component);
    session.add(component)
    session.commit()
    session.refresh(component)
    return component

@router.get("/diagram")
async def read_components(parent_id: Optional[int]=None, session: Session = Depends(get_session)):
    statement = select(Component, Edge).join(Edge, Edge.source == Component.id, isouter=True)

    if not parent_id or parent_id is None:
        statement = statement.where(Component.parent_id == None)
    else:
        statement = statement.where(Component.parent_id == parent_id)

    pane = session.exec(statement).all()
    
    nodes_temp = {}
    edges = []
    for component, edge in pane:
        
        if component.id not in nodes_temp:
            nodes_temp[component.id] = component

        if edge:
            edges.append(edge)        
    return {"nodes": list(nodes_temp.values()), "edges": edges}
    

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

    print(component_data)
    db_comp = session.get(Component, id)

    db_comp.model_dump(exclude_unset=True)
    db_comp.sqlmodel_update(component_data)

    session.add(db_comp)
    session.commit()
    session.refresh(db_comp)
    return db_comp

@router.post("/groups")
async def create_component_group(data: dict, session: Session = Depends(get_session)):
    print(data)
    # Check if nodes are already part of group
    node_ids = data.get("nodes")
    # create group component
    statement = select(Component).where(Component.id.in_(node_ids))
    
    children = session.exec(statement).all()

    base_node = children[0]

    new_group = Component(
        name="New Group",
        type="groupNode",
        x_pos=data.get("x_pos"),
        y_pos=data.get("y_pos"),
        width=data.get("width"),   
        height=data.get("height"),
        parent_id=base_node.parent_id # ensure this exists in same pane as other nodes
    )

    session.add(new_group)
    session.flush()

    for child in children:
        if child.parent_id:
            print(f"Node {child.id} is moving from group {child.group_id} to {new_group.id}")
            return 
        child.group_id = new_group.id
        child.x_pos -= new_group.x_pos
        child.y_pos -= new_group.y_pos
        session.add(child)
    

    session.commit()
    session.refresh(new_group)

    return new_group


