from fastapi import FastAPI
from sqlmodel import SQLModel
from .routers import component, edge, task, project
from .models.component import Component
from .models.edge import Edge
from .dependencies import engine
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.include_router(component.router)
app.include_router(edge.router)
app.include_router(task.router)
app.include_router(project.router)
SQLModel.metadata.create_all(engine)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "App is Running!"}