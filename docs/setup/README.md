# Developer Environment & Local Setup Guide

## Purpose

This guide provides instructions for setting up the Enterprise AI Platform development environment.

---

## 🛠 Prerequisites

Ensure your development machine has the following tools installed:

- **Git**: `2.40+`
- **Node.js**: `20.x` or higher
- **pnpm**: `v10.x` or higher (preferred) or `npm` `v10.x`
- **Python**: `3.11+`
- **Docker Desktop / Docker Engine**: `24.0+` with Docker Compose `v2.20+`
- **Ollama**: (Optional for local LLM inference) `v0.3.0+`

---

## 🚀 Environment Initialization (Planned Workflow)

```bash
# 1. Clone the repository
git clone https://github.com/RahulJaggi/enterprise-ai-platform.git
cd enterprise-ai-platform

# 2. Copy environment variable template (when created in Phase 2)
cp .env.example .env

# 3. Start local infrastructure services (PostgreSQL, Qdrant, Ollama)
# (Infrastructure docker-compose will be provided in Phase 2)
docker compose up -d

# 4. Install dependencies across monorepo workspace
pnpm install

# 5. Run local development servers
pnpm dev
```

---

## 🧪 Verification

Verify your environment configuration once services are launched:

- Backend Health Endpoint: `http://localhost:4000/api/v1/health`
- Qdrant Vector Dashboard: `http://localhost:6333/dashboard`
- Next.js Web UI: `http://localhost:3000`
