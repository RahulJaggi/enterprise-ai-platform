# Security Policy

## Overview

The Enterprise AI Platform is designed for mission-critical enterprise environments. Security, confidentiality, and data protection are fundamental to our system architecture.

---

## Supported Versions

Only the latest release versions receive active security updates and patch releases:

| Version    | Supported                             |
| :--------- | :------------------------------------ |
| `v0.1.x`   | :white_check_mark: Active Development |
| `< v0.1.0` | :x: End of Life                       |

---

## Reporting a Vulnerability

If you discover a security vulnerability within this repository or platform, please **do not** open a public issue.

### Disclosure Process

1. Send a detailed report to the security response team at `security@enterprise-ai.internal`.
2. Include the following details in your report:
   - Description of the vulnerability and potential impact.
   - Step-by-step proof-of-concept (PoC) or reproduction script.
   - Affected components (e.g., API Gateway, NestJS Backend, LangGraph Orchestrator, Qdrant Vector Store, Ollama integration).
   - Any proposed mitigations or fixes.

### Response SLA

- **Initial Acknowledgment**: Within 24 hours.
- **Triage & Risk Assessment**: Within 3 business days.
- **Fix & Patch Advisory**: Dependent on severity (Critical: <7 days, High: <14 days).

---

## Enterprise Security Architecture Standards

All components and future code contributions must follow these core security principles:

1. **Zero Trust & Least Privilege**:
   - Explicit authentication & authorization for every service-to-service and client-to-service communication.
   - Role-Based Access Control (RBAC) and Attribute-Based Access Control (ABAC) enforced at the API gateway and backend layer.

2. **Data Isolation & Multi-Tenancy**:
   - Vector database collections (Qdrant) must enforce strict tenant-level payload filtering and index isolation.
   - Relational database schemas (PostgreSQL) must utilize Row Level Security (RLS) where multi-tenant data coexists.

3. **LLM & AI Safety Guardrails**:
   - Input sanitization and prompt injection defense mechanisms prior to sending queries to LLM providers (Ollama / Remote APIs).
   - Output validation and PII / sensitive data redaction filters on model responses.

4. **Secrets & Environment Management**:
   - Zero hardcoded secrets in source control.
   - External secret providers (e.g., HashiCorp Vault, AWS Secrets Manager, Kubernetes Secrets) must be used for production secrets.

5. **Dependency & Supply Chain Security**:
   - Automated dependency vulnerability scanning (Snyk / Dependabot / Trivy).
   - Container image scanning before deployment.
