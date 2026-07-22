# Enterprise Engineering Principles

This document defines the core software engineering principles, architectural patterns, code organization rules, error handling strategies, and logging philosophies enforced across the Enterprise AI Platform codebase.

All software engineers, AI developers, and system architects contributing to this platform must adhere to these foundational principles.

---

## 📋 Table of Contents

- [Core Design Principles](#-core-design-principles)
  - [1. SOLID Principles](#1-solid-principles)
  - [2. DRY (Don't Repeat Yourself)](#2-dry-dont-repeat-yourself)
  - [3. KISS (Keep It Simple, Stupid)](#3-kiss-keep-it-simple-stupid)
  - [4. YAGNI (You Aren't Gonna Need It)](#4-yagni-you-arent-gonna-need-it)
- [Architectural Patterns](#-architectural-patterns)
  - [Clean Architecture](#clean-architecture)
  - [Feature-Based Structure](#feature-based-structure)
  - [Dependency Injection (DI)](#dependency-injection-di)
- [Operational Philosophies](#-operational-philosophies)
  - [Error Handling Philosophy](#error-handling-philosophy)
  - [Logging Philosophy](#logging-philosophy)

---

## 🧠 Core Design Principles

### 1. SOLID Principles

Every module, component, and class within the platform must adhere to SOLID object-oriented and functional design principles:

- **Single Responsibility Principle (SRP)**:
  - Each module, class, or service must have _one, and only one, reason to change_.
  - _Example_: A NestJS service handling user authentication (`AuthService`) must never directly execute vector database embedding calculations (`VectorService`).

- **Open/Closed Principle (OCP)**:
  - Software entities must be _open for extension, but closed for modification_.
  - _Example_: Abstract LLM providers behind a generic `LLMProvider` interface so new models (e.g. Ollama, OpenAI, Claude) can be added without mutating existing execution loops.

- **Liskov Substitution Principle (LSP)**:
  - Derived classes or interface implementations must be completely substitutable for their base abstractions without altering application correctness.

- **Interface Segregation Principle (ISP)**:
  - Clients should never be forced to depend on methods they do not use. Prefer small, cohesive, role-specific interfaces over bloated monolithic interfaces.

- **Dependency Inversion Principle (DIP)**:
  - High-level business logic modules must not depend on low-level implementation details. Both must depend on abstractions (interfaces).

---

### 2. DRY (Don't Repeat Yourself)

- **Single Source of Truth**: Shared domain models, DTOs, and API responses reside in `@enterprise-ai/types`. Shared design system primitives reside in `@enterprise-ai/ui`.
- **Avoid Duplicated Logic**: Duplicate code across modules leads to inconsistent bug fixes and technical debt.
- **Rule of Three**: If code logic is duplicated twice, refactor it into a reusable function or utility package upon the third occurrence.

---

### 3. KISS (Keep It Simple, Stupid)

- **Strive for Clarity over Cleverness**: Code is read 10x more often than it is written. Write explicit, self-documenting code rather than dense or obscure one-liners.
- **Explicit Naming**: Avoid ambiguous variable names (`x`, `data`, `res`). Use descriptive, domain-aligned identifiers (`embeddingVectorBatch`, `tenantConfigPayload`).

---

### 4. YAGNI (You Aren't Gonna Need It)

- **Build for Today's Requirements**: Do not over-engineer speculative abstraction layers or premature optimizations for features that do not exist yet.
- **Pragmatic Extensibility**: Design systems to be adaptable when requirements arrive, rather than implementing unused, unverified infrastructure upfront.

---

## 🏗 Architectural Patterns

### Clean Architecture

We enforce **Clean Architecture** (Onion / Hexagonal Architecture) boundaries to isolate core enterprise business logic from framework drivers, database engines, and UI layers:

```text
+-----------------------------------------------------------------------+
|                       Frameworks & Drivers                            |
|             (Next.js, NestJS, Prisma, Qdrant, Docker)                 |
|   +---------------------------------------------------------------+   |
|   |                   Interface Adapters                          |   |
|   |         (Controllers, Resolvers, Gateway DTOs)                |   |
|   |   +-------------------------------------------------------+   |   |
|   |   |                Application Business Rules             |   |   |
|   |   |                 (Use Cases, Services)                 |   |   |
|   |   |   +-----------------------------------------------+   |   |   |
|   |   |   |               Enterprise Domain               |   |   |   |
|   |   |   |             (Entities, Interfaces)            |   |   |   |
|   |   |   +-----------------------------------------------+   |   |   |
|   |   +-------------------------------------------------------+   |   |
|   +---------------------------------------------------------------+   |
+-----------------------------------------------------------------------+
```

- **Domain Layer**: Contains pure business entities and repository interfaces. Has ZERO external dependencies.
- **Use Case / Application Layer**: Contains application-specific workflows and business orchestration rules.
- **Adapters & Controllers Layer**: Converts data between domain use-cases and external transports (REST, WebSockets, gRPC).
- **Infrastructure & Drivers Layer**: Database access implementations, ORMs, framework configurations, and external APIs.

---

### Feature-Based Structure

Rather than organizing projects by technical layer (`controllers/`, `services/`, `models/` globally), code is structured primarily by **Domain Feature**:

```text
apps/api/src/modules/
├── auth/                       # Auth Domain Feature Module
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── auth.module.ts
│   └── dto/
├── agents/                     # Agent Management Feature Module
│   ├── agents.controller.ts
│   ├── agents.service.ts
│   ├── agents.module.ts
│   └── dto/
└── rag/                        # Knowledge Base / RAG Feature Module
    ├── rag.controller.ts
    ├── rag.service.ts
    ├── rag.module.ts
    └── dto/
```

Benefits:

- High cohesion and localized context when working on a specific feature.
- Deletion or refactoring of a feature requires operating within a single directory boundary.

---

### Dependency Injection (DI)

- **Inversion of Control**: Services and components must never instantiate their own dependencies via `new ConcreteService()`.
- **Constructor Injection**: Dependencies are injected explicitly via class constructors using NestJS DI containers or TypeScript constructor parameters.
- **Testability**: Injected abstractions allow effortless swapping of concrete implementations with mock instances during unit testing.

---

## ⚙️ Operational Philosophies

### Error Handling Philosophy

1. **No Swallowing Exceptions**: Never use empty `try/catch` blocks or silently suppress runtime errors.
2. **Explicit Error Hierarchies**: Define domain-specific exception types (`TenantNotFoundException`, `VectorStoreUnavailableException`, `PromptInjectionDetectedException`).
3. **Fail-Fast Principle**: Validate method parameters and request payloads at the system boundary (API Gateway entry). Reject invalid data early before invoking expensive operations.
4. **Standardized API Error Envelope**: All API error responses returned to clients follow a uniform JSON structure:
   ```json
   {
     "success": false,
     "data": null,
     "error": {
       "code": "VECTOR_SEARCH_TIMEOUT",
       "message": "The vector database query exceeded the 5000ms threshold.",
       "details": [],
       "timestamp": "2026-07-22T12:00:00.000Z",
       "traceId": "trace_8f9a2b1c3d4e5f6a"
     }
   }
   ```
5. **No Leaking Internal Stack Traces**: Stack traces and raw database exception messages must never be exposed to external API clients in production. Log full traces internally while returning sanitized, actionable error messages to users.

---

### Logging Philosophy

1. **Structured JSON Output**: All logs emitted across applications must be formatted as structured JSON logs to enable automated ingestion by log aggregation pipelines (Elasticsearch, Loki).
2. **Mandatory Log Context & Correlation IDs**: Every log statement must automatically include key contextual metadata:
   - `timestamp` (ISO 8601 UTC)
   - `level` (`debug`, `info`, `warn`, `error`)
   - `service` (`api-gateway`, `web-portal`, `ai-engine`)
   - `traceId` / `correlationId` (Correlates log statements across microservice boundaries)
   - `tenantId` (Identifies enterprise tenant context)
3. **Log Levels**:
   - **`DEBUG`**: Detailed diagnostic details for local debugging and troubleshooting.
   - **`INFO`**: High-level informational events (e.g. user logged in, agent graph execution completed).
   - **`WARN`**: Unexpected situations or degraded conditions that did not halt execution (e.g. retry attempted, cache miss fallback).
   - **`ERROR`**: Actionable system failures or unhandled exceptions requiring developer intervention.
4. **PII and Credentials Protection**: Never log sensitive user credentials, private cryptographic keys, raw JWT tokens, or un-redacted PII in log outputs.
