# Enterprise AI Platform Master Blueprint Index

Welcome to the **Master Architecture Blueprint** for the Enterprise AI Platform. This directory contains 18 technical specification documents providing a comprehensive blueprint of the system's architecture, security boundaries, request lifecycles, and deployment models.

---

## 📑 Specification Index

| #      | Specification Document                                             | Description                                                                            |
| :----- | :----------------------------------------------------------------- | :------------------------------------------------------------------------------------- |
| **01** | [System Overview](01-system-overview.md)                           | High-level system architecture, service planes, and core capabilities.                 |
| **02** | [Folder Structure Blueprint](02-folder-structure.md)               | Monorepo layout, workspace organization, and package boundaries.                       |
| **03** | [Module Responsibilities Blueprint](03-module-responsibilities.md) | Subsystem responsibilities across Auth, Agent, RAG, and Audit modules.                 |
| **04** | [Request Flow Blueprint](04-request-flow.md)                       | End-to-end HTTP, WebSocket, and SSE streaming request lifecycles.                      |
| **05** | [Authentication & Authorization Flow](05-authentication-flow.md)   | Identity management, JWT issue/refresh, RBAC, and tenant context propagation.          |
| **06** | [RAG Architecture & Pipeline Flow](06-rag-flow.md)                 | Ingestion pipeline, chunking, embedding generation, and Qdrant hybrid search.          |
| **07** | [AI Agent Execution Flow](07-ai-agent-flow.md)                     | LangGraph state graph execution loop, tool registry, and human-in-the-loop interrupts. |
| **08** | [Database Architecture Blueprint](08-database-overview.md)         | PostgreSQL schemas, Qdrant vector payload indexing, and Redis caching.                 |
| **09** | [API Design Blueprint](09-api-design.md)                           | REST URI conventions, response envelopes, and OpenAPI specs.                           |
| **10** | [Error Handling Architecture](10-error-handling.md)                | Global exception filtering, sanitization, and error code classifications.              |
| **11** | [Logging Architecture Blueprint](11-logging.md)                    | Structured JSON logging (Pino), trace correlation IDs, and PII redaction.              |
| **12** | [Security Architecture Blueprint](12-security.md)                  | Zero Trust boundaries, multi-tenant payload isolation, and prompt guardrails.          |
| **13** | [Performance Optimization Blueprint](13-performance.md)            | Performance SLA targets, indexing tuning, and response streaming.                      |
| **14** | [Caching Architecture Blueprint](14-caching.md)                    | L1/L2 caching, TTL matrix, and Qdrant semantic LLM caching.                            |
| **15** | [Background Jobs Architecture](15-background-jobs.md)              | BullMQ asynchronous queues, worker concurrency, and retry strategies.                  |
| **16** | [Event-Driven Architecture](16-event-flow.md)                      | Internal domain events, Pub/Sub messaging, and event handler maps.                     |
| **17** | [Deployment Architecture](17-deployment.md)                        | Multi-stage Docker builds, Kubernetes Helm manifests, and CI/CD pipelines.             |
| **18** | [Future Technical Roadmap](18-future-roadmap.md)                   | Strategic multi-phase engineering roadmap from 2026 Q3 to 2027 Q2.                     |
