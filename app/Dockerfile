# FROM python:3.13-slim

# WORKDIR /usr/src/app

# RUN apt-get update && apt-get install -y openssh-client

# COPY requirements.txt .

# RUN pip install --no-cache-dir -r requirements.txt

# COPY . .

# COPY entrypoint.sh .

# RUN chmod +x entrypoint.sh

# EXPOSE 5001


# ENTRYPOINT ["./entrypoint.sh"]
FROM python:3.13-slim

WORKDIR /usr/src/app

RUN apt-get update && apt-get install -y openssh-client

# Copy requirements from app folder (or root if requirements.txt is at root)
COPY app/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application backend code
COPY app/ ./app

# Copy Alembic files into /usr/src/app
COPY alembic.ini .
COPY alembic/ ./alembic

# Copy entrypoint script
COPY app/entrypoint.sh .
RUN chmod +x entrypoint.sh

EXPOSE 5001

ENTRYPOINT ["./entrypoint.sh"]