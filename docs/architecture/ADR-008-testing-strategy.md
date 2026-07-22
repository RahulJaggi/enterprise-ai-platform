# ADR-008: Testing Strategy

- **Status**: Accepted
- **Date**: 2026-07-22
- **Authors**: Quality Assurance & Platform Engineering Team
- **Deciders**: Principal Architect, QA Lead

---

## Context

To maintain system stability across frontend interfaces, API Gateway microservices, vector search pipelines, and non-deterministic LLM agent state graphs, a comprehensive multi-tiered testing methodology is required.

---

## Decision

We decide to enforce a **4-Tier Testing Strategy**:

1. **Unit Testing**: **Jest** / **Vitest** for testing isolated utility functions, shared libraries (`@enterprise-ai/shared`, `@enterprise-ai/types`), and NestJS services.
2. **Integration Testing**: **Supertest** for NestJS API controller testing against live PostgreSQL/Redis test containers.
3. **End-to-End (E2E) Testing**: **Playwright** for browser automation testing of user journeys in `@enterprise-ai/web`.
4. **AI Evaluation & RAG Benchmark Testing**: **PyTest** paired with evaluation frameworks (Ragas / TruLens) for measuring vector retrieval accuracy and LLM tool execution determinism.

---

## Alternatives Considered

1. **Unit Testing Only**:
   - _Rejected_: Insufficient for catching integration failures between API Gateways, vector databases, and LLM agent runtimes.
2. **Cypress instead of Playwright**:
   - _Rejected_: Playwright provides superior multi-browser support, speed, native TypeScript integration, and headless performance in CI environments.

---

## Pros

- **Comprehensive Test Coverage**: High confidence when deploying code changes to production environments.
- **Deterministic RAG Benchmark Scoring**: Prevents retrieval quality degradation when tuning chunking strategies or embedding models.
- **Automated E2E Verification**: Ensures critical user flows (login, agent execution, document ingestion) remain functional.

---

## Cons

- Longer total CI build execution time.
- Requires maintenance of test database fixtures and mock LLM response providers.

---

## Consequences

- Every package in `packages/` and app in `apps/` includes dedicated unit test directories (`__tests__` or `*.spec.ts`).
- CI matrix parallelizes unit, integration, and E2E job suites.

---

## Future Improvements

- Continuous synthetic LLM evaluation jobs scheduled on nightly builds.
- Visual regression testing using Playwright screenshot comparisons.
