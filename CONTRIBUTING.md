# Contributing to Enterprise AI Platform

Thank you for your interest in contributing to the Enterprise AI Platform! This document provides guidelines and workflows to help you contribute effectively.

---

## Code of Conduct

All contributors are expected to adhere to our [Code of Conduct](CODE_OF_CONDUCT.md). Please read it before participating in project activities.

---

## Getting Started

### Prerequisites
Before starting development, ensure you have installed:
- **Node.js**: `v20.x` or higher (LTS recommended)
- **pnpm** / **npm**: `v10.x` or higher
- **Python**: `3.11+`
- **Docker & Docker Compose**: `24.0+`
- **Git**: `2.40+`

### Repository Setup
1. Fork and clone the repository:
   ```bash
   git clone https://github.com/RahulJaggi/enterprise-ai-platform.git
   cd enterprise-ai-platform
   ```
2. Verify local environment prerequisites:
   ```bash
   node -v
   python3 --version
   docker --version
   ```

---

## Branch Strategy

We follow a structured Git Flow / Trunk-Based hybrid strategy:

* `main` — Production-ready code. Protected branch. Requires signed commits and PR approval.
* `develop` — Integration branch for incoming features and fixes.
* `feature/<short-description>` — Feature development branches off `develop`.
* `fix/<short-description>` — Bug fix branches off `develop`.
* `hotfix/<short-description>` — Critical production fixes off `main`.
* `release/vX.Y.Z` — Release preparation branches.

### Naming Conventions
- Feature: `feature/auth-rbac-integration`
- Fix: `fix/qdrant-connection-retry`
- Refactor: `refactor/langgraph-state-schema`
- Docs: `docs/api-specification-update`

---

## Git Commit Convention

We enforce the [Conventional Commits](https://www.conventionalcommits.org/) specification format:

```text
<type>(<scope>): <short summary>

[optional body]

[optional footer(s)]
```

### Commit Types
| Type | Purpose |
| :--- | :--- |
| `feat` | A new user-facing or system feature |
| `fix` | A bug fix |
| `docs` | Documentation changes only |
| `style` | Formatting, missing semi-colons, no code logic change |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `perf` | Code change that improves performance |
| `test` | Adding or updating tests |
| `build` | Changes to build system or dependencies |
| `ci` | Changes to CI configuration files or scripts |
| `chore` | Maintenance tasks or non-src file updates |

### Examples
- `feat(rag): add chunking strategy configuration for PDF ingestion`
- `fix(backend): resolve token expiration race condition in NestJS guard`
- `docs(architecture): document LangGraph agent execution loop`

---

## Pull Request Process

1. **Keep PRs Focused**: Each PR should address a single logical change or issue.
2. **Sync with Target Branch**: Rebase your branch against `develop` prior to submission.
3. **Include Tests**: Ensure unit and integration tests are updated or added for new features/fixes.
4. **Fill out PR Template**: Provide clear context, design decisions, verification steps, and issue references.
5. **Pass Automated CI/CD**: All status checks (linting, type checking, security scans, unit tests) must pass before review.
6. **Code Review**: At least 1 approval from a core maintainer is required.

---

## Coding Standards

- **TypeScript**: Strict mode enabled (`"strict": true`). Explicit return types required on exported functions.
- **Python**: Type hints required (`typing`). Adhere to `PEP 8` and `black` formatting.
- **Linting & Formatting**: Clean run of linters (`eslint`, `prettier`, `ruff` / `flake8`). No unhandled lint errors allowed.
- **Security**: Never hardcode credentials, tokens, or private keys. Use environment variables and secrets management.

---

## Documentation

If your changes alter APIs, architecture, environment variables, or workflows, update the relevant documentation under `/docs`:
- Architectural changes -> `docs/architecture/`
- Architecture decisions -> `docs/decisions/` (ADR)
- API modifications -> `docs/api/`
- Setup changes -> `docs/setup/`

Thank you for helping build a robust Enterprise AI Platform!
