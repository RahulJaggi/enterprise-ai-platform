# API Specifications & Contracts

## Purpose

This directory contains the official API specifications, OpenAPI contracts, WebSocket event schemas, and RPC protocols for the Enterprise AI Platform.

---

## 📡 Planned API Domains

| Domain                            | Protocol                     | Description                                                            |
| :-------------------------------- | :--------------------------- | :--------------------------------------------------------------------- |
| **Authentication & Users**        | REST (`/api/v1/auth`)        | User login, tenant onboarding, token refresh, RBAC management.         |
| **Agents & Workflows**            | REST / WS (`/api/v1/agents`) | Agent CRUD, state graph execution, live stream agent thoughts & steps. |
| **RAG Ingestion & Vector Search** | REST (`/api/v1/rag`)         | Document upload, embedding indexing, semantic search queries.          |
| **Models & Providers**            | REST (`/api/v1/models`)      | LLM provider management, Ollama model pulling, token usage analytics.  |

---

## 📐 API Specification Guidelines

1. **REST Protocol**: All REST APIs adhere to OpenAPI 3.0 specification guidelines (`openapi.yaml`).
2. **Versioning**: APIs are explicitly versioned in the URI path (e.g. `/api/v1/...`).
3. **Streaming**: Real-time LLM response generation utilizes Server-Sent Events (SSE) or WebSockets.
4. **Response Wrapper**: Standardized response wrapper format:
   ```json
   {
     "success": true,
     "data": {},
     "error": null,
     "timestamp": "2026-07-22T12:00:00.000Z"
   }
   ```
