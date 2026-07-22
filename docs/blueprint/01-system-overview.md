# 01 - System Overview

## Purpose

The Enterprise AI Platform is a production-grade, multi-tenant, cloud-native system designed to orchestrate generative AI workloads, intelligent agents, Retrieval-Augmented Generation (RAG) pipelines, and enterprise data integrations with strict security and observability guardrails.

---

## Architecture

The system follows a modular monorepo architecture divided into distinct service planes:

```mermaid
graph TD
    Client["Client Web Portal (Next.js 15)"] -->|HTTPS / WSS| Gateway["API Gateway & Auth (NestJS)"]
    Gateway -->|DB Queries| Postgres[("PostgreSQL 16 (Relational DB)")]
    Gateway -->|Cache / Queues| Redis[("Redis 7 (Cache & Jobs)")]
    Gateway -->|gRPC / REST| AIEngine["AI Agent Engine (@enterprise-ai/ai)"]
    AIEngine -->|Vector Search| Qdrant[("Qdrant Vector DB")]
    AIEngine -->|LLM Inference| Ollama["Ollama / Cloud LLM APIs"]
```

### Key Subsystems:
1. **Presentation Plane (`apps/web`)**: Next.js 15 React application for agent administration, document upload dashboards, and real-time streaming chat.
2. **API Gateway Plane (`apps/api`)**: NestJS backend managing authentication, RBAC, rate limiting, and request routing.
3. **AI Engine Plane (`packages/ai`)**: LangGraph & LangChain stateful graph orchestrator managing agent reasoning loops and tool execution.
4. **Data Persistence Plane**: Polyglot persistence with PostgreSQL 16 (metadata/audit), Redis 7 (caching/queues), and Qdrant (vector embeddings).

---

## Responsibilities

- **Enterprise Governance**: Enforces tenant-level data isolation, role-based access controls, and prompt security guardrails.
- **Agent Orchestration**: Executes multi-step, stateful reasoning workflows with human-in-the-loop validation checkpoints.
- **Low-Latency RAG**: Performs dense and hybrid vector retrieval against Qdrant vector indices.
- **Local & Hybrid LLM Execution**: Supports local air-gapped inference via Ollama alongside commercial LLM APIs.

---

## Dependencies

- **Frameworks**: Next.js 15, React 19, NestJS, LangGraph, LangChain, Tailwind CSS.
- **Databases**: PostgreSQL 16, Qdrant Vector Store v1.11, Redis 7.
- **Inference Runtime**: Ollama, OpenAI / Anthropic APIs.

---

## Sequence Flow

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Web as Web Client (Next.js)
    participant API as API Gateway (NestJS)
    participant Agent as AI Engine (LangGraph)
    participant Vector as Vector Store (Qdrant)
    participant LLM as Model Provider (Ollama)

    User->>Web: Submit Query / Prompt
    Web->>API: POST /api/v1/agents/chat (JWT Bearer)
    API->>API: Validate Auth, RBAC & Rate Limits
    API->>Agent: Dispatch Agent Execution Task
    Agent->>Vector: Query Relevant Embeddings (Filtered by Tenant)
    Vector-->>Agent: Return Top-K Document Context
    Agent->>LLM: Stream Prompt + RAG Context
    LLM-->>Agent: Stream Model Response Tokens
    Agent-->>API: Forward Token Stream
    API-->>Web: Server-Sent Events (SSE) Stream
    Web-->>User: Render Real-Time Agent Stream
```

---

## Best Practices

- **Zero Trust Security**: Every service boundary validates incoming tokens and tenant metadata context.
- **Strict Decoupling**: Application layers communicate through defined interfaces (`@enterprise-ai/types`).
- **Resilience**: Circuit breakers and exponential backoff retry mechanisms wrap all external LLM and database calls.

---

## Future Extensions

- **Multi-Region Replication**: Active-active PostgreSQL and Qdrant cluster replication across global cloud regions.
- **Edge LLM Inference**: WebAssembly / ONNX runtime integration for client-side privacy-first execution.
