from sqlmodel import Session, create_engine
import os
from dotenv import load_dotenv

load_dotenv()

print(os.environ)
print(f'postgresql://{os.getenv('POSTGRES_USER')}:{os.getenv('POSTGRES_PASSWORD')}@{os.getenv('POSTGRES_HOST')}:5432/{os.getenv('POSTGRES_DB')}')
engine = create_engine(f'postgresql://{os.getenv('POSTGRES_USER')}:{os.getenv('POSTGRES_PASSWORD')}@{os.getenv('POSTGRES_HOST')}:5432/{os.getenv('POSTGRES_DB')}')

def get_session():
    with Session(engine) as session:
        yield session
