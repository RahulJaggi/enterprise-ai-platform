# 06 - RAG Architecture & Pipeline Flow Blueprint

## Purpose

This document details the Retrieval-Augmented Generation (RAG) architecture, document ingestion pipeline, text chunking strategies, vector embedding generation, and Qdrant hybrid vector retrieval flow.

---

## Architecture

The RAG pipeline operates across two main execution phases: **Ingestion** and **Retrieval**.

```text
[Document Ingestion Phase]
Document (PDF/DOCX) -> File Extractor -> Recursive Chunking -> Embeddings API -> Qdrant Vector Store

[Query Retrieval Phase]
User Query -> Embeddings API -> Dense/Sparse Hybrid Query -> Qdrant (Tenant Filter) -> Context Ranker -> LLM Prompt
```

---

## Responsibilities

- **Document Extraction**: Parses raw files (PDFs, Word documents, text, Markdown) into structured text strings.
- **Semantic Chunking**: Splits text using semantic sliding windows (512 tokens with 64-token overlap).
- **Embedding Generation**: Generates 1536-dimensional dense vector embeddings using OpenAI (`text-embedding-3-small`) or Ollama (`nomic-embed-text`).
- **Hybrid Retrieval**: Queries Qdrant using dense vector similarity (Cosine distance) + sparse BM25 keyword matching with tenant payload isolation.

---

## Dependencies

- Qdrant Vector Store (`@qdrant/js-client-rest`).
- LangChain Document Loaders & Text Splitters.
- Embedding Model Provider API (Ollama / OpenAI).

---

## Sequence Flow

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Ingestion as Ingestion Service
    participant Embedder as Embedding API
    participant Qdrant as Qdrant Vector DB
    participant LLM as Model Provider

    rect rgb(240, 248, 255)
        note over User, Qdrant: Phase 1: Document Ingestion Pipeline
        User->>Ingestion: Upload Document (PDF) + Tenant ID
        Ingestion->>Ingestion: Extract Text & Apply Recursive Chunking
        Ingestion->>Embedder: Batch Request Vector Embeddings
        Embedder-->>Ingestion: Return 1536d Vector Arrays
        Ingestion->>Qdrant: Upsert Points (Vectors + Payload: tenant_id, doc_id, chunk_text)
        Qdrant-->>User: Ingestion Completed
    end

    rect rgb(255, 245, 238)
        note over User, LLM: Phase 2: RAG Context Retrieval & Generation
        User->>Ingestion: Search Query ("Summarize Q3 Financial Report")
        Ingestion->>Embedder: Embed Query Text
        Embedder-->>Ingestion: Return Query Vector
        Ingestion->>Qdrant: Search (Query Vector, Filter: tenant_id == "tenant_123", TopK=5)
        Qdrant-->>Ingestion: Return Top-5 Matching Text Chunks
        Ingestion->>LLM: Send Synthesized Prompt (Query + Top-5 Chunks)
        LLM-->>User: Stream Grounded Answer with Citations
    end
```

---

## Best Practices

- **Metadata Payload Isolation**: All Qdrant points must store `tenant_id` in their payload and filter by `tenant_id` on every query.
- **Context Reranking**: Re-ranks top-K retrieved chunks using a cross-encoder model prior to injecting into the LLM context window.

---

## Future Extensions

- **Parent-Child Chunking**: Store small chunks for vector retrieval linked to larger parent documents for LLM context generation.
- **GraphRAG**: Knowledge graph extraction using Neo4j integrated alongside vector search.
