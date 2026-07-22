# ADR-001: Monorepo Strategy

- **Status**: Accepted
- **Date**: 2026-07-22
- **Authors**: Core Architecture Team
- **Deciders**: Enterprise AI Platform Engineering Lead, Principal Architect

---

## Context

Scaling an Enterprise AI Platform across frontend web portals, backend API gateways, AI agent orchestrators, shared design libraries, type definitions, and deployment infrastructure requires a codebase organization that balances developer velocity, code reuse, dependency management, and type safety across teams.

---

## Decision

We decide to adopt a **Modular Monorepo Architecture** managed using **pnpm workspaces** and **Turborepo**.

- **`apps/`**: Application entrypoints (`web`, `api`).
- **`packages/`**: Shared libraries (`ui`, `shared`, `types`, `config`, `ai`).
- **`infrastructure/`**: Infrastructure as code (Docker, Kubernetes).
- **`docs/`**: Platform documentation and architectural records.

---

## Alternatives Considered

1. **Polyrepo (Separate Repositories)**:
   - _Rejected_: High overhead for cross-repository pull requests, duplicate interface definitions, and version drift between frontend DTOs and backend endpoints.
2. **Nx Monorepo**:
   - _Rejected_: Additional abstraction layer and generator complexity compared to lightweight pnpm + Turborepo setup.
3. **Lerna / Yarn Workspaces**:
   - _Rejected_: Slower package linking performance and less efficient build caching than pnpm + Turborepo.

---

## Pros

- **Zero Code Duplication**: Shared types (`@enterprise-ai/types`) and UI components (`@enterprise-ai/ui`) imported directly across applications.
- **Instant Type Intellisense**: Changes in domain DTOs reflect immediately in frontend and backend without publishing npm packages.
- **Turbo Build Caching**: Incremental build and test caching accelerates CI/CD pipelines.
- **Atomic Commits & Pull Requests**: Architectural changes across API, UI, and docs committed in a single logical PR.

---

## Cons

- Single repository file size increases over time.
- Requires discipline when managing root `package.json` vs workspace package dependencies.
- Initial CI pipeline setup requires configuring build matrix caches.

---

## Consequences

- Applications and packages maintain clean internal `package.json` boundaries.
- Developers execute workspace commands from the root using `pnpm` and `turbo`.

---

## Future Improvements

- Implementation of Remote Build Caching (Turborepo Remote Cache) for global team build acceleration.
- Automated change-aware CI filtering to run tests only for impacted packages.
