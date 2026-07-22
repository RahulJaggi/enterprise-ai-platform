# ADR-004: AI Architecture

* **Status**: Accepted
* **Date**: 2026-07-22
* **Authors**: AI & Data Science Team
* **Deciders**: Principal Architect, AI Technical Lead

---

## Context

The platform requires a scalable, privacy-preserving AI orchestration framework capable of executing complex agent loops, stateful multi-step reasoning, Retrieval-Augmented Generation (RAG), vector search, and local on-premise model execution.

---

## Decision

We decide to standardize our AI stack on **LangGraph & LangChain** for stateful agent orchestration, **Qdrant** for vector storage, and **Ollama** for local, privacy-first LLM inference.

---

## Alternatives Considered

1. **Custom Python Agent Scripts**:
   - *Rejected*: Lacks standardized state graph persistence, checkpointing, and human-in-the-loop validation mechanisms.
2. **AutoGen / CrewAI**:
   - *Rejected*: LangGraph provides superior low-level graph state control, graph cyclic routing, and enterprise checkpointing.
3. **Cloud-Only LLMs (OpenAI/Anthropic Only)**:
   - *Rejected*: Fails air-gapped data privacy requirements for sensitive enterprise deployment targets.

---

## Pros

* **Stateful Agent Graphs**: LangGraph supports cyclic graphs, state persistence, conditional branching, and human approval checkpoints.
* **Hybrid Vector Retrieval**: Qdrant enables high-speed dense embedding search combined with sparse vector keyword filtering and payload tenant isolation.
* **Privacy & Air-Gap Compliance**: Ollama enables local execution of open-weight models (Llama 3, Qwen, Mistral) without data leaving the enterprise network boundary.

---

## Cons

* Rapid evolution of AI framework APIs requires strict dependency version pinning.
* High memory and GPU/CPU resource overhead during local model execution.

---

## Consequences

- All AI orchestration logic is encapsulated within `@enterprise-ai/ai` and dedicated Python AI microservices.
- Model providers are abstracted behind a unified LLM adapter interface.

---

## Future Improvements

- Dynamic Cost & Latency Model Router (routing simple queries to local Ollama and complex queries to commercial cloud models).
- Continuous RAG retrieval evaluation scoring pipeline (Ragas / TruLens).
