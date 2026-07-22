# System Architecture Documentation

## Purpose

This directory contains the high-level system architecture design, component interactions, data flows, and security model for the Enterprise AI Platform.

---

## 🏛 System Overview & Architectural Components

The Enterprise AI Platform is composed of six core subsystems:

1. **Frontend Presentation Layer (`apps/frontend`)**:
   - Next.js 15 app router application providing UI interfaces for interactive LLM chats, AI agent graph creation, document ingestion management, and platform administrative settings.

2. **Backend API Gateway (`apps/backend`)**:
   - NestJS server providing RESTful endpoints and WebSockets for real-time streaming responses.
   - Enforces authentication (JWT/OAuth2), Role-Based Access Control (RBAC), rate limiting, and request sanitization.

3. **LangGraph Agent Orchestrator (`services/ai-engine`)**:
   - Python & Node.js stateful graph executor managing agent loops, memory state persistence, tool call execution, and human-in-the-loop decision checkpoints.

4. **Vector Database Engine (Qdrant)**:
   - Manages dense embeddings and sparse vectors for Retrieval-Augmented Generation (RAG).
   - Enforces payload-based tenant isolation filtering.

5. **Relational Database (PostgreSQL)**:
   - Stores tenant profiles, user credentials, agent configuration graphs, conversation histories, and immutable audit logs.

6. **Local / Cloud LLM Execution Runtime**:
   - Integrates with Ollama for air-gapped, privacy-compliant inference (e.g. Llama 3, Qwen, Mistral) with extensible adapters for external commercial LLM APIs.

---

## 📊 Component Data Flow Blueprint

```text
[User Client] ---> (HTTPS / WS) ---> [NestJS Gateway]
                                          |
                        +-----------------+-----------------+
                        |                                   |
              [PostgreSQL (Auth/Audit)]              [LangGraph Agent Loop]
                                                            |
                                            +---------------+---------------+
                                            |                               |
                                  [Qdrant Vector DB]                [Ollama LLM]
                                 (RAG Context Lookup)              (Inference Execution)
```

---

## 🔐 Security Boundaries & Governance

- **Zero Trust Service Layer**: Intra-service communications use TLS encryption and mutual service token validation.
- **Tenant Isolation**: Qdrant collections and PostgreSQL queries strictly enforce `tenant_id` filtering.
- **Prompt Guardrails**: Input validation to defend against prompt injections and PII redaction on LLM outputs.

---

## 📑 Upcoming Specifications

- `docs/architecture/system-blueprint.md` — Detailed component architecture diagram.
- `docs/architecture/rag-pipeline-spec.md` — Chunking, embedding, and vector index design.
- `docs/architecture/security-threat-model.md` — Threat modeling and risk mitigations.
