# Local Development Infrastructure

## Overview

This directory contains the Docker Compose environment for local infrastructure services supporting the Enterprise AI Platform.

---

## 🛠 Provisioned Services & Exposed Ports

| Service | Container Name | Host Port | Internal Port | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **PostgreSQL 16** | `enterprise_ai_postgres` | `5432` | `5432` | Relational database (Metadata, Users, Audit Logs) |
| **Redis 7** | `enterprise_ai_redis` | `6379` | `6379` | Caching, session store, message queues |
| **Qdrant Vector DB** | `enterprise_ai_qdrant` | `6333`, `6334` | `6333` (HTTP), `6334` (gRPC) | Vector database for embeddings & RAG search |
| **pgAdmin 4** | `enterprise_ai_pgadmin` | `5050` | `80` | Web UI database administration dashboard |

---

## 🔑 Default Environment Credentials

> [!IMPORTANT]
> The credentials below match the defaults set in `.env.example`. Do not use default credentials in production environments.

### PostgreSQL
- **Host**: `localhost` (or `postgres` within Docker network)
- **Port**: `5432`
- **Database**: `enterprise_ai_db`
- **Username**: `postgres`
- **Password**: `postgres_secure_password`

### Redis
- **Host**: `localhost` (or `redis` within Docker network)
- **Port**: `6379`
- **Password**: `redis_secure_password`

### Qdrant Vector Store
- **HTTP REST Endpoint**: `http://localhost:6333`
- **gRPC Endpoint**: `http://localhost:6334`
- **Health Check Endpoint**: `http://localhost:6333/readyz`

### pgAdmin Management Portal
- **Dashboard URL**: `http://localhost:5050`
- **Login Email**: `admin@enterprise-ai.internal`
- **Login Password**: `admin_secure_password`
- **Connecting to Postgres in pgAdmin**:
  - Host name / address: `postgres`
  - Port: `5432`
  - Username: `postgres`
  - Password: `postgres_secure_password`

---

## 📦 Persistent Docker Volumes

All data is stored in named Docker volumes to ensure persistence across container restarts:
- `enterprise_ai_postgres_data` -> PostgreSQL database files
- `enterprise_ai_redis_data` -> Redis snapshot & append-only data
- `enterprise_ai_qdrant_data` -> Qdrant vector index storage
- `enterprise_ai_pgadmin_data` -> pgAdmin configuration & saved connections

---

## 🚀 How to Start Services

1. Navigate to the infrastructure directory:
   ```bash
   cd infrastructure/docker
   ```

2. Copy the environment variables file:
   ```bash
   cp .env.example .env
   ```

3. Start all services in background (detached mode):
   ```bash
   docker compose up -d
   ```

4. View service status and health checks:
   ```bash
   docker compose ps
   ```

5. View real-time service logs:
   ```bash
   docker compose logs -f
   ```

---

## 🛑 How to Stop Services

To stop running containers without losing data:
```bash
docker compose stop
```

To bring down containers while preserving persistent volumes:
```bash
docker compose down
```

---

## 🔄 How to Reset the Environment (Wipe All Data)

If you need a clean reset of all database states, caches, and vector indexes:

```bash
# Stop containers and remove persistent volumes
docker compose down -v

# Re-launch clean infrastructure containers
docker compose up -d
```
