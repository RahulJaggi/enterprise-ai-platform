# ADR-005: Database Strategy

* **Status**: Accepted
* **Date**: 2026-07-22
* **Authors**: Data & Database Infrastructure Team
* **Deciders**: Principal Architect, Lead Database Administrator

---

## Context

The platform requires persistence across distinct data paradigms: ACID-compliant relational data for user management, tenant profiles, and audit trails; high-throughput caching and job queues; and high-dimensional vector embeddings for semantic search.

---

## Decision

We decide to implement a **Polyglot Persistence Strategy**:

1. **PostgreSQL 16 (with Prisma / TypeORM)**: Primary relational store for operational metadata, tenant settings, RBAC profiles, agent definitions, and audit logs.
2. **Redis 7**: Distributed in-memory cache, session store, rate-limiting store, and job queue manager (BullMQ).
3. **Qdrant**: Dedicated vector database for embedding indices, semantic chunk search, and payload-filtered multi-tenancy.

---

## Alternatives Considered

1. **PostgreSQL + `pgvector` for Everything**:
   - *Rejected*: While `pgvector` is convenient, Qdrant provides superior HNSW indexing performance, payload filtering speed, and dedicated vector memory management at enterprise scale.
2. **MongoDB / Document Store**:
   - *Rejected*: Relational schema constraints are required to guarantee relational integrity for audit logs and RBAC credentials.
3. **SaaS Vector Databases (Pinecone)**:
   - *Rejected*: Cloud-only vector stores conflict with enterprise air-gapped on-premise deployment requirements.

---

## Pros

* **Optimal Engine for Each Use-Case**: Relational integrity via Postgres, microsecond caching via Redis, and specialized vector indexing via Qdrant.
* **Multi-Tenant Payload Filtering**: Qdrant enforces tenant-level payload index isolation without cross-tenant vector data leaks.
* **Local & Production Parity**: All three engines run locally via Docker Compose and scale seamlessly to cloud managed services.

---

## Cons

* Increases operational complexity of running three separate database systems.
* Requires multi-database backup and disaster recovery procedures.

---

## Consequences

- Database migrations managed deterministically via ORM schema migration scripts.
- Connection pooling and retry logic implemented for all database drivers.

---

## Future Improvements

- PostgreSQL read-replica setup for query offloading.
- Qdrant distributed cluster sharding for multi-node vector scale.
