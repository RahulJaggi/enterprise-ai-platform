# Enterprise AI Platform

> Production-grade Enterprise AI Platform built with Next.js, NestJS, LangGraph, RAG, Ollama, Qdrant, PostgreSQL, and Docker.

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Goals](#-goals)
- [High-Level Architecture](#-high-level-architecture)
- [Planned Tech Stack](#-planned-tech-stack)
- [Planned Folder Structure](#-planned-folder-structure)
- [Development Phases](#-development-phases)
- [Contribution Guidelines](#-contribution-guidelines)
- [Coding Standards](#-coding-standards)
- [Git Commit Convention](#-git-commit-convention)
- [Branch Strategy](#-branch-strategy)
- [Documentation Index](#-documentation-index)
- [License](#-license)

---

## 🔭 Project Overview

The **Enterprise AI Platform** is an enterprise-ready, multi-tenant orchestration system for generative AI applications, intelligent agents, and Retrieval-Augmented Generation (RAG) workflows. Designed to run on hybrid cloud or fully air-gapped infrastructure, the platform enables organizations to securely deploy LLMs, manage vector stores, execute agentic graphs, and enforce strict security governance.

---

## 🎯 Goals

- **Enterprise Security & Compliance**: Strict Role-Based Access Control (RBAC), multi-tenant vector & database payload isolation, and zero-trust API communications.
- **Agentic AI Orchestration**: Modular, stateful workflow graph execution powered by LangGraph, enabling multi-step reasoning, tool execution, and human-in-the-loop validation.
- **High-Performance RAG Pipeline**: Low-latency semantic search and retrieval utilizing Qdrant vector database, custom chunking strategies, and hybrid search (sparse + dense embeddings).
- **Flexible LLM Runtime**: Support for local, privacy-first inference via Ollama alongside pluggable integrations for enterprise commercial LLM endpoints.
- **Production Observability & Governance**: Full audit logging, telemetry, latency tracking, cost guardrails, and token usage analytics across all model interactions.

---

## 🏗 High-Level Architecture

The platform follows a microservices / modular monorepo architecture divided into distinct service planes:

```text
+-------------------------------------------------------------------------------+
|                               Presentation Layer                              |
|                          Next.js 15 (React 19, Tailwind)                      |
+-------------------------------------------------------------------------------+
                                       |
                                  REST / WSS / gRPC
                                       v
+-------------------------------------------------------------------------------+
|                              API Gateway & Auth                               |
|                         NestJS (RBAC, Rate Limit, Auth)                       |
+-------------------------------------------------------------------------------+
     |                                 |                                 |
     v                                 v                                 v
+-----------------------+   +-----------------------+   +-----------------------+
|   PostgreSQL / Prisma |   |  LangGraph Agent Loop |   |  Qdrant Vector Engine |
| (Users, Audit, Metadata)| | (State Graph, Tools)  |   | (Dense/Sparse Vectors)|
+-----------------------+   +-----------------------+   +-----------------------+
                                       |
                                       v
                            +-----------------------+
                            |  Ollama / LLM Runtime |
                            | (Local & Remote Models)|
                            +-----------------------+
```

### Architecture Description

1. **Frontend Layer**: Next.js 15 web application providing real-time chat interfaces, agent builder UI, document ingestion dashboards, and administrative controls.
2. **Backend API Gateway**: NestJS application handling user authentication, session management, RBAC enforcement, rate limiting, and request routing.
3. **AI Engine / Agent Orchestrator**: LangGraph runtime processing complex multi-step reasoning loops, agent state persistence, tool execution, and agentic workflows.
4. **Vector Database**: Qdrant vector store handling document embeddings, payload filtering, tenant isolation, and hybrid search.
5. **Relational Database**: PostgreSQL managing user data, tenant configurations, agent definitions, chat histories, and compliance audit logs.
6. **Model Execution Layer**: Ollama for local, privacy-compliant LLM inference with extensible adapters for cloud LLM APIs.

---

## 🛠 Planned Tech Stack

| Category             | Technology                                     | Purpose                                        |
| :------------------- | :--------------------------------------------- | :--------------------------------------------- |
| **Frontend UI**      | Next.js 15, React 19, TypeScript, Tailwind CSS | Enterprise Admin Portal & Agent Interfaces     |
| **Backend Core**     | NestJS, TypeScript, Node.js v20+               | API Gateway, Auth, System Services             |
| **AI Orchestration** | LangGraph, LangChain, Python / TypeScript      | Stateful Agent Workflows & Tool Call Execution |
| **Vector Database**  | Qdrant                                         | Dense & Hybrid Embedding Vector Storage        |
| **Relational DB**    | PostgreSQL 16+, Prisma / TypeORM               | System Metadata, Audit Logs, App State         |
| **LLM Inference**    | Ollama, Local Models (Llama 3, Qwen, Mistral)  | Air-Gapped / Privacy-Preserving Inference      |
| **Containerization** | Docker, Docker Compose, Kubernetes             | Container Deployment & Service Orchestration   |
| **Testing**          | Jest, Vitest, Playwright, PyTest               | Unit, Integration & E2E Verification           |

---

## 📁 Planned Folder Structure

```text
enterprise-ai-platform/
├── .github/                  # CI/CD Workflows, issue templates, PR templates
├── docs/                     # Comprehensive enterprise documentation
│   ├── api/                  # API contracts, OpenAPI specs, GraphQL schemas
│   ├── architecture/         # System design diagrams, specs, and threat models
│   ├── decisions/            # Architectural Decision Records (ADRs)
│   └── setup/                # Local setup and environment provisioning guides
├── apps/ (planned)           # Application entry points
│   ├── frontend/             # Next.js Web Portal
│   └── backend/              # NestJS Gateway & System Core
├── services/ (planned)       # Microservices & engines
│   ├── ai-engine/            # LangGraph agent orchestrator & Python services
│   └── ingestion-service/    # Document extraction & embedding pipeline
├── packages/ (planned)       # Shared TypeScript & Python packages
│   ├── config/               # Shared TS/ESLint/Prettier configurations
│   ├── database/             # Shared Prisma schemas & DB migrations
│   └── shared-types/         # Shared API DTOs & domain interfaces
├── infra/ (planned)          # Infrastructure as Code
│   ├── docker/               # Dockerfiles & docker-compose configurations
│   └── k8s/                  # Helm charts & Kubernetes manifests
├── scripts/ (planned)        # Tooling, seeders, and developer automation
├── .editorconfig             # Enterprise Editor Settings
├── .gitattributes            # Git text attribute configuration
├── .gitignore                # Enterprise ignore list
├── CHANGELOG.md              # Project history & semver release log
├── CODE_OF_CONDUCT.md        # Community conduct rules
├── CONTRIBUTING.md           # Developer onboarding & submission guidelines
├── LICENSE                   # Software license terms
├── README.md                 # Project root documentation
└── SECURITY.md               # Vulnerability reporting & security policy
```

---

## 🚀 Development Phases

### Phase 1: Foundation & Architectural Specifications (Current Phase)

- Establish repository structure, enterprise governance guidelines, and specification templates.
- Define system architecture, data models, security boundaries, and API schemas.

### Phase 2: Core Platform & Infrastructure Setup

- Provision Docker Compose environment for PostgreSQL, Qdrant, and Ollama.
- Initialize Next.js 15 frontend shell and NestJS backend gateway with core authentication.

### Phase 3: AI Engine & RAG Pipeline Implementation

- Implement document ingestion pipeline (chunking, embedding, vector indexing in Qdrant).
- Build LangGraph stateful agent orchestrator with custom tool execution modules.

### Phase 4: Enterprise Features & Security Hardening

- Implement multi-tenant data isolation and RBAC security controls.
- Integrate audit logging, telemetry, latency tracking, and cost guardrails.

### Phase 5: Production Readiness & Scale

- Execute end-to-end testing, performance benchmarking, and security penetration testing.
- Deliver Kubernetes Helm charts and CI/CD automated deployment pipelines.

---

## 🤝 Contribution Guidelines

We welcome enterprise contributors and team members to participate!
Please refer to our detailed [CONTRIBUTING.md](CONTRIBUTING.md) guide for instructions on:

- Setting up local development environments.
- Branching conventions and pull request lifecycle.
- Testing and quality assurance expectations.

---

## 📏 Coding Standards

- **Strict Type Checking**: TypeScript strict mode enabled (`"strict": true`). Python code requires PEP 484 type annotations.
- **Linting & Formatting**: Clean compliance with ESLint, Prettier, and Python Black/Ruff standards.
- **Zero Unhandled Errors**: All asynchronous operations must include explicit error handling and logging.
- **No Secrets in Source Control**: Credentials and private keys must be fetched from environment variables.

---

## 📜 Git Commit Convention

We enforce the [Conventional Commits](https://www.conventionalcommits.org/) format:

```text
<type>(<scope>): <subject>
```

Common types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`.

Example:
`feat(rag): implement hybrid search retrieval in Qdrant integration`

---

## 🌿 Branch Strategy

We adhere to a Git Flow / Trunk-Based hybrid branch lifecycle:

- `main` — Production-grade stable releases.
- `develop` — Active integration branch.
- `feature/*` — Feature development branches.
- `fix/*` — Bug resolution branches.
- `release/*` — Release qualification branches.

---

## 📚 Documentation Index

Detailed platform documentation is available in the [`docs/`](docs/) directory:

- [Architecture Documentation](docs/architecture/README.md)
- [Architectural Decision Records (ADRs)](docs/decisions/README.md)
- [API Specifications](docs/api/README.md)
- [Developer Setup Guide](docs/setup/README.md)

---

## 📄 License

This project is licensed under the terms of the [MIT License](LICENSE).
