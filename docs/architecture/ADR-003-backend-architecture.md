# ADR-003: Backend Architecture

- **Status**: Accepted
- **Date**: 2026-07-22
- **Authors**: Backend Architecture Team
- **Deciders**: Principal Architect, Backend Lead

---

## Context

The backend serves as the core API Gateway, security boundary, authentication provider, audit logging collector, and bridge between web clients, relational databases, vector stores, and AI agent execution runtimes.

---

## Decision

We decide to build the backend gateway (`apps/api`) using **NestJS** (Node.js/TypeScript) adhering to **Clean Architecture** and **Dependency Injection** principles.

---

## Alternatives Considered

1. **Express.js / Fastify Raw**:
   - _Rejected_: Lacks standardized architectural conventions, requiring custom dependency injection containers and manual module structuring.
2. **Python (FastAPI)**:
   - _Rejected_: While FastAPI is excellent for AI microservices, using NestJS for the core API Gateway allows full TypeScript DTO sharing between frontend and backend.
3. **Go (Gin/Fiber)**:
   - _Rejected_: Increased friction sharing type definitions across TypeScript frontend and Go backend.

---

## Pros

- **Structured Architecture**: Enforces modular enterprise organization (Modules, Controllers, Services, DTOs).
- **Native Dependency Injection**: Simplifies testing, mocking, and decoupling business logic from external drivers.
- **Built-in Security Guards**: Declarative Role-Based Access Control (RBAC) via NestJS Guards and Interceptors.
- **Auto-generated API Specs**: Native Swagger / OpenAPI specification generation from TypeScript DTO decorators.

---

## Cons

- Additional framework boilerplate compared to minimal HTTP routers.
- Execution overhead of Node.js event loop for CPU-bound tasks (mitigated by offloading AI processing to dedicated services).

---

## Consequences

- Business logic is isolated from HTTP handlers.
- All request payloads undergo strict validation via NestJS `ValidationPipe` and Zod/Class-Validator schemas.

---

## Future Improvements

- gRPC transport layer adoption for high-performance internal microservice communication.
- Automated API client generation for frontend consumption.
