## Project Deployment & Workflow Documentation

This document outlines the local development workflow, containerization strategy, registry management, and production deployment pipeline for the self-hosted stack.

---

### 1. Architecture & Services

* **Database (`db`):** PostgreSQL 16 Alpine with persistent storage mapped to `/opt/postgres/data`.
* **Backend (`backend`):** FastAPI application communicating with PostgreSQL.
* **Frontend (`frontend`):** React/Vite application served via Nginx with an API reverse-proxy pass.
* **Networking:** Internal Docker bridge network (`planning-net`) with explicit port mappings on the host.

---

### 2. Local Development Workflow

Use this workflow on your development machine for rapid iteration and code changes.

1. **Start the Database:**
Spin up just the database using Docker Compose:
```bash
docker compose up db -d

```


2. **Run the Backend Locally:**
Execute Uvicorn with auto-reload pointing to your local database configuration:
```bash
uvicorn main:app --host 0.0.0.0 --port 5001 --reload

```


3. **Run the Frontend Locally:**
Start the Vite development server:
```bash
npm run dev

```



---

### 3. Local Container Testing & Registry Push

Before pushing updates to production, verify the containerized stack locally, tag the images, and push them to your local private registry.

1. **Build and Test Locally via Compose:**
```bash
docker compose up --build -d

```


2. **Tag and Push to Private Registry:**
Use your local automation script or execute manually (ensure your registry host includes the correct port and is configured in your Docker daemon's `insecure-registries`):
```bash
REGISTRY_HOST="100.79.58.8:5000"

docker tag project-planner-backend:latest $REGISTRY_HOST/project-planner-backend:v0.0.1
docker tag project-planner-frontend:latest $REGISTRY_HOST/project-planner-frontend:v0.0.1

docker push $REGISTRY_HOST/project-planner-backend:v0.0.1
docker push $REGISTRY_HOST/project-planner-frontend:v0.0.1

```



---

### 4. Production Deployment Workflow (Dashboard PC)

On your hosting/dashboard server (running Ubuntu Server), deploy using pre-built images pulled directly from your local registry.

#### Prerequisites (One-Time Setup)

1. **Configure Insecure Registry:**
Add your registry to `/etc/docker/daemon.json` on the Ubuntu host:
```json
{
  "insecure-registries": [
    "100.79.58.8:5000",
    "100.79.58.8"
  ]
}

```


Restart the Docker service:
```bash
sudo systemctl restart docker

```


2. **Environment Files Setup:**
Ensure your production directory contains an `apps.env` file with your database credentials:
```env
POSTGRES_USER=<user>
POSTGRES_PASSWORD=<password>
POSTGRES_DB=planner-prod-db
POSTGRES_HOST=planning-db

```


And a `.env` file for Docker Compose image tag interpolation:
```env
REGISTRY_HOST=100.79.58.8
IMAGE_TAG=0.0.1

```



#### Production `docker-compose.yml`

```yaml
services:
  db:
    image: postgres:16-alpine
    container_name: planning-db
    restart: always
    env_file:
      - apps.env
    volumes:
      - /opt/postgres/data:/var/lib/postgresql/data
    networks:
      - planning-net

  backend:
    image: ${REGISTRY_HOST}:5000/project-planner-backend:v${IMAGE_TAG}
    container_name: planning-backend
    restart: always
    env_file:
      - apps.env
    ports:
      - "5001:5001"
    depends_on:
      - db
    networks:
      - planning-net

  frontend:
    image: ${REGISTRY_HOST}:5000/project-planner-frontend:v${IMAGE_TAG}
    container_name: planning-frontend
    restart: always
    ports:
      - "3000:80"
    depends_on:
      - backend
    networks:
      - planning-net

networks:
  planning-net:
    driver: bridge

```

#### Updating the Production Deployment

To roll out a new version to the dashboard PC:

```bash
# Pull the latest tagged images from your registry
docker compose pull

# Restart containers with the updated images cleanly
docker compose up -d --remove-orphans

```

---

### 5. Troubleshooting Reference

* **PostgreSQL Database Not Found Error:**
* *Cause:* The `postgres:16-alpine` image only initializes databases (`POSTGRES_DB`) on the initial creation of an empty data volume. If the volume already exists, subsequent changes to environment variables are ignored.
* *Fix:* Manually create the database via container execution (`docker exec -it planning-db psql -U <user> -c "CREATE DATABASE \"planner-prod-db\";"`) or clear out the host bind mount (`sudo rm -rf /opt/postgres/data/*`) for a fresh bootstrap.


* **Docker Push/Pull HTTPS Connection Errors (`dial tcp ... connectex: No connection could be made`):**
* *Cause:* Docker defaults to secure HTTPS if an IP/domain is not explicitly listed as an insecure registry or if the port is omitted.
* *Fix:* Ensure both the development and hosting machines have the registry IP and port (`100.79.58.8:5000`) added to their Docker daemon configuration, and restart the Docker service.