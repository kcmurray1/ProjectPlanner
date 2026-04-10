from fastapi import FastAPI
from sqlmodel import SQLModel
from .routers import component
from .models.component import Component, ComponentLink
from .dependencies import engine
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.include_router(component.router)
SQLModel.metadata.create_all(engine)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], # Your Vite URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "App is Running!"}