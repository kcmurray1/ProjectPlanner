from sqlmodel import Session, create_engine
import os
from dotenv import load_dotenv

load_dotenv()

engine = create_engine(f'postgresql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}@{os.getenv('DB_HOST')}:5432/project_planner_db')

def get_session():
    with Session(engine) as session:
        yield session
