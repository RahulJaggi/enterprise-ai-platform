# @enterprise-ai/api

## Purpose

The `@enterprise-ai/api` application is the central API Gateway and backend microservice orchestrator for the Enterprise AI Platform.

---

## 🎯 Planned Responsibilities

- **Authentication & RBAC**: JWT & OAuth2 token validation, session persistence, and enterprise role-based authorization guards.
- **REST & Real-Time Gateway**: OpenAPI-compliant REST endpoints and WebSocket / SSE handlers for real-time agent token streaming.
- **Data Persistence**: Database ORM layer connecting to PostgreSQL for users, tenants, agent configurations, and audit telemetry.
- **Service Integration**: Orchestrates calls between vector databases (Qdrant), LLM inference providers (Ollama), and agent engines (`@enterprise-ai/ai`).

---

## 🛑 Current Status

Workspace placeholder. Backend frameworks (NestJS) will be scaffolded in subsequent implementation phases. No application code or dependencies exist in this directory yet.
