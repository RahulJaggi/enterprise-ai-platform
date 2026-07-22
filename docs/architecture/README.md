# System Architecture Documentation

## Purpose

This directory contains the high-level system architecture design, component interactions, data flows, security model, and Architecture Decision Records (ADRs) for the Enterprise AI Platform.

---

## 🏛 System Overview & Architectural Components

The Enterprise AI Platform is composed of six core subsystems:

1. **Frontend Presentation Layer (`apps/frontend` / `@enterprise-ai/web`)**:
   - Next.js 15 app router application providing UI interfaces for interactive LLM chats, AI agent graph creation, document ingestion management, and platform administrative settings.

2. **Backend API Gateway (`apps/backend` / `@enterprise-ai/api`)**:
   - NestJS server providing RESTful endpoints and WebSockets for real-time streaming responses.
   - Enforces authentication (JWT/OAuth2), Role-Based Access Control (RBAC), rate limiting, and request sanitization.

3. **LangGraph Agent Orchestrator (`services/ai-engine` / `@enterprise-ai/ai`)**:
   - Stateful graph executor managing agent loops, memory state persistence, tool call execution, and human-in-the-loop decision checkpoints.

4. **Vector Database Engine (Qdrant)**:
   - Manages dense embeddings and sparse vectors for Retrieval-Augmented Generation (RAG).
   - Enforces payload-based tenant isolation filtering.

5. **Relational Database (PostgreSQL)**:
   - Stores tenant profiles, user credentials, agent configuration graphs, conversation histories, and immutable audit logs.

6. **Local / Cloud LLM Execution Runtime**:
   - Integrates with Ollama for air-gapped, privacy-compliant inference (e.g. Llama 3, Qwen, Mistral) with extensible adapters for external commercial LLM APIs.

---

## 📑 Architecture Decision Records (ADRs) Index

All core architectural decisions are recorded under this directory:

| ADR | Title | Status | Date |
| :--- | :--- | :--- | :--- |
| **[ADR-001](ADR-001-monorepo-strategy.md)** | Monorepo Strategy | `Accepted` | 2026-07-22 |
| **[ADR-002](ADR-002-frontend-architecture.md)** | Frontend Architecture | `Accepted` | 2026-07-22 |
| **[ADR-003](ADR-003-backend-architecture.md)** | Backend Architecture | `Accepted` | 2026-07-22 |
| **[ADR-004](ADR-004-ai-architecture.md)** | AI Architecture | `Accepted` | 2026-07-22 |
| **[ADR-005](ADR-005-database-strategy.md)** | Database Strategy | `Accepted` | 2026-07-22 |
| **[ADR-006](ADR-006-coding-standards.md)** | Coding Standards | `Accepted` | 2026-07-22 |
| **[ADR-007](ADR-007-security-standards.md)** | Security Standards | `Accepted` | 2026-07-22 |
| **[ADR-008](ADR-008-testing-strategy.md)** | Testing Strategy | `Accepted` | 2026-07-22 |
| **[ADR-009](ADR-009-deployment-strategy.md)** | Deployment Strategy | `Accepted` | 2026-07-22 |
| **[ADR-010](ADR-010-observability-strategy.md)** | Observability Strategy | `Accepted` | 2026-07-22 |

---

## 📘 Engineering Principles

Please refer to [`docs/engineering-principles.md`](../engineering-principles.md) for detailed guidelines on SOLID, DRY, KISS, YAGNI, Clean Architecture, Feature-based structure, Dependency Injection, error handling, and logging philosophies.
