# ADR-009: Deployment Strategy

* **Status**: Accepted
* **Date**: 2026-07-22
* **Authors**: DevOps & Infrastructure Team
* **Deciders**: Principal Architect, DevOps Lead

---

## Context

The platform must support deployment across diverse infrastructure targets: developer workstations (local Docker Compose), public cloud providers (AWS, GCP, Azure), and private air-gapped enterprise datacenters with strict internet egress controls.

---

## Decision

We decide to standardize our infrastructure deployment pipeline around **Containerization (Docker)** and **Kubernetes Orchestration**:

1. **Local Infrastructure**: Docker Compose (`infrastructure/docker/docker-compose.yml`) for localized development with zero cloud dependency.
2. **Production Infrastructure**: Immutable OCI Container Images deployed via **Kubernetes (Helm Charts)** under `infrastructure/k8s/`.
3. **Continuous Deployment**: Automated GitOps delivery workflows driven by GitHub Actions.

---

## Alternatives Considered

1. **Serverless Functions (AWS Lambda / Vercel Only)**:
   - *Rejected*: Serverless execution time limits and cold start latencies conflict with long-running LLM agent graph executions and local on-premise air-gap requirements.
2. **Virtual Machine (VM) Direct Deployments**:
   - *Rejected*: Higher operational friction, dependency drift, and slower scaling compared to containerized orchestration.

---

## Pros

* **Universal Portability**: Identical containerized behavior across local laptop, hybrid cloud, and air-gapped enterprise environments.
* **Declarative Auto-Scaling**: Kubernetes Horizontal Pod Autoscaling (HPA) scales backend microservices and AI engine pods dynamically based on load.
* **Zero Downtime Updates**: Rolling deployment strategies with readiness and liveness probes.

---

## Cons

* Kubernetes cluster setup and operational maintenance overhead.
* Resource requirements for running full containerized stacks during local development.

---

## Consequences

- All applications (`apps/web`, `apps/api`) maintain production-ready multi-stage `Dockerfile` definitions.
- Configuration managed via Kubernetes ConfigMaps and Secret manifests.

---

## Future Improvements

- Implementation of GitOps automation utilizing ArgoCD or Flux.
- Terraform / OpenTofu Infrastructure-as-Code modules for automated cloud infrastructure provisioning.
