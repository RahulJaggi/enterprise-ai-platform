# Enterprise AI Platform

> Production-grade Enterprise AI Platform featuring a modular monorepo architecture. Built with Next.js/Vite React frontend, NestJS API gateway, Qdrant vector database, and Ollama local LLM runtime for privacy-first, high-performance RAG and agentic workflows.

---

## 📋 Table of Contents

- [🔭 Project Overview](#-project-overview)
- [🏗 High-Level Architecture](#-high-level-architecture)
- [🧩 Completed Features (Done So Far)](#-completed-features-done-so-far)
- [⚙️ Technical Implementation & Pipelines](#-technical-implementation--pipelines)
  - [1. Knowledge Ingestion Pipeline](#1-knowledge-ingestion-pipeline)
  - [2. Semantic Search Pipeline](#2-semantic-search-pipeline)
  - [3. Retrieval-Augmented Generation (RAG) Pipeline](#3-retrieval-augmented-generation-rag-pipeline)
- [📡 API Documentation Summary](#-api-documentation-summary)
- [🚀 Local Developer Quickstart](#-local-developer-quickstart)
  - [1. Prerequisites](#1-prerequisites)
  - [2. Start Infrastructure Containers](#2-start-infrastructure-containers)
  - [3. Prepare Local Inference Models](#3-prepare-local-inference-models)
  - [4. Install Dependencies & Build](#4-install-dependencies--build)
  - [5. Run Development Servers](#5-run-development-servers)
- [🛡️ Observability, Resilience & Scalability](#-observability-resilience--scalability)
- [🌿 Branch & Commit Standards](#-branch--commit-standards)

---

## 🔭 Project Overview

The **Enterprise AI Platform** is an enterprise-ready, multi-tenant orchestration system for generative AI applications, intelligent playground bots, and Retrieval-Augmented Generation (RAG) pipelines. It enables organizations to securely ingest documents, segment content into searchable vector stores, run vector similarity search, and generate grounded answers using local, air-gapped Large Language Models (LLMs) with strict security controls.

---

## 🏗 High-Level Architecture

The workspace is structured as a **Turborepo monorepo** separating the presentation plane from backend gateways and ingestion modules:

```text
+-----------------------------------------------------------------------------------+
|                                PRESENTATION LAYER                                 |
|               Vite React 18, TypeScript, Tailwind CSS, Lucide Icons               |
|            Pages: Dashboard, AI Playground, Knowledge Base, Knowledge Search      |
+-----------------------------------------------------------------------------------+
                                         |
                                    REST / HTTP
                                         v
+-----------------------------------------------------------------------------------+
|                              BACKEND API GATEWAY                                  |
|               NestJS, TypeScript (ValidationPipes, ExceptionFilters)              |
+-----------------------------------------------------------------------------------+
        |                    |                    |                      |
        v                    v                    v                      v
+---------------+   +------------------+   +--------------+      +------------------+
| Ingestion     |   | AI Playground    |   | Search       |      | RAG Orchestrator |
| Parsing/Chunk |   | Chat & Memory    |   | Vector Query |      | Citations/LLM    |
+---------------+   +------------------+   +--------------+      +------------------+
        |                    |                    |                      |
        |                    +----------+         |                      |
        v                               v         v                      v
+---------------+                  +------------------------------------------------+
| Qdrant DB     |                  | Ollama Inference Engine (Localhost:11434)      |
| REST API      |                  | Models:                                        |
| Port: 6333    |                  |  - nomic-embed-text (768d Embeddings)          |
| (Vectors)     |                  |  - qwen2.5:7b       (Chat completions)         |
+---------------+                  +------------------------------------------------+
```

### Module Plane Breakdown

1. **`apps/web` (Frontend Presentation)**: Vite-powered React client. Provides a modern dark-mode admin workspace with:
   - **Dashboard**: High-level platform health metrics.
   - **AI Playground**: Real-time chat workspace supporting chat history memory and model response visualization.
   - **Knowledge Base**: Drag-and-drop document upload interface with chunk configuration and interactive vector pipeline telemetry.
   - **Knowledge Search**: Unified page supporting semantic vector hits and grounded AI answers.
2. **`apps/api` (Backend Gateway)**: NestJS server handling validation, exception filtering, and API contracts:
   - **`DocumentModule`**: Ingests multi-page PDF documents and extracts raw text using `pdf-parse`.
   - **`ChunkModule`**: Segments document text into pieces using fixed-size windowing strategies with custom size/overlap configurations.
   - **`EmbeddingModule`**: Generates high-dimensional vector embeddings using local Ollama endpoints.
   - **`VectorModule`**: Handles vector persistence and checks in the local Qdrant database.
   - **`SearchModule`**: Executes high-performance query vector creation and cosine-similarity searches.
   - **`RagModule`**: Coordinates document search results, builds prompt context, extracts citations, and calls the chat model.
   - **`AiModule`**: Handles Playground chats with temporary message history.

---

## 🧩 Completed Features (Done So Far)

- **PDF Ingestion & Text Extraction**: Backend uploader parsing uploaded binary PDFs and returning raw page counts and text structures.
- **Flexible Chunking Engine**: Customizable chunk size and overlap sliders mapping text ranges to document indices.
- **Ollama Embedding Provider**: REST embedding provider connecting to `http://localhost:11434/api/embeddings` using `nomic-embed-text`. Includes automatic retries and fallback handling.
- **Qdrant Vector Database Integration**: Connects to Qdrant REST API (`http://localhost:6333`) to automatically ensure collection setups, handle vector dimensions checks and auto-recreation, and upsert document payloads (`documentId`, `chunkId`, `filename`, `pageNumber`, `chunkIndex`, `content`).
- **High-Performance Semantic Search**: Injects user queries, creates embeddings on-the-fly, queries Qdrant using cosine similarity, and displays rank-ordered match results with similarity percentages.
- **Retrieval-Augmented Generation (RAG)**: Complete question-answering system. Uses similarity ranking to restrict LLM contexts, calculates citation lists (`filename`, `pageNumber`, `chunkId`), evaluates an overall confidence percentage, and falls back to a grounded warning if information is missing.
- **AI Playground Chat**: Full conversational workspace supporting streaming/non-streaming chat completions with Ollama (`qwen2.5:7b`) and session history memory.

---

## ⚙️ Technical Implementation & Pipelines

### 1. Knowledge Ingestion Pipeline

```text
[PDF Upload]
     │ (Binary multipart/form-data)
     ▼
[apps/api: DocumentController]
     │ (Parses metadata & pages via pdf-parse)
     ▼
[apps/api: ChunkService]
     │ (Applies FixedSizeChunkStrategy: chunkSize & overlap)
     ▼
[apps/api: EmbeddingService]
     │ (Concurrent batch generation using nomic-embed-text)
     ▼
[apps/api: VectorService & QdrantProvider]
     │ (Checks size, auto-creates collection if missing)
     │ (Batches points in groups of 50 for HTTP efficiency)
     ▼
[Qdrant Database (localhost:6333)]
```

### 2. Semantic Search Pipeline

```text
[User Search Query] (UI Input)
        │
        ▼
[Embedding Generation] (nomic-embed-text)
        │ (768d dense query vector)
        ▼
[Qdrant Search Request] (POST /collections/:name/points/search)
        │ (Cosine similarity matching)
        ▼
[Top-K Matching Chunks] (Rank-ordered list with metadata payloads)
```

### 3. Retrieval-Augmented Generation (RAG) Pipeline

```text
               [User Question]
                      │
                      ▼
            [Vector Search in Qdrant]
                      │
        ┌─────────────┴─────────────┐
        │ Top Score >= 0.25         │ Top Score < 0.25
        ▼                           ▼
[Extract Citations]         [Grounded Fallback Answer]
[Calculate Confidence]      "The requested information was
[Build Grounded Prompt]      not found in indexed documents."
        │                           │
        ▼                           │
[Ollama Chat: qwen2.5:7b]           │
        │                           │
        └─────────────┬─────────────┘
                      ▼
          [Formatted RAG Response]
    (Answer, Confidence, Citations, Chunks)
```

---

## 📡 API Documentation Summary

### Document Ingestion & Vector Management

#### 1. Upload & Extract PDF

- **Endpoint**: `POST /api/v1/documents/upload`
- **Format**: `multipart/form-data` (`file: File`)
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "filename": "annual_report.pdf",
      "pageCount": 12,
      "characterCount": 24500,
      "text": "Extracted document text..."
    }
  }
  ```

#### 2. Chunk Raw Text

- **Endpoint**: `POST /api/v1/documents/chunk`
- **Payload**:
  ```json
  {
    "text": "Raw document text...",
    "chunkSize": 1000,
    "overlap": 200
  }
  ```

#### 3. Generate Embeddings

- **Endpoint**: `POST /api/v1/documents/embed`
- **Payload**:
  ```json
  {
    "chunks": [{ "chunkId": "chk_1", "content": "Chunk content..." }],
    "model": "nomic-embed-text"
  }
  ```

#### 4. Index Chunks in Qdrant

- **Endpoint**: `POST /api/v1/documents/index`
- **Payload**:
  ```json
  {
    "collectionName": "enterprise_knowledge",
    "filename": "annual_report.pdf",
    "chunks": [
      {
        "chunkId": "chk_1",
        "chunkIndex": 0,
        "pageNumber": 1,
        "content": "Chunk content...",
        "embedding": [0.012, -0.045, 0.089]
      }
    ]
  }
  ```

---

### Retrieval & Generation

#### 1. Semantic Vector Search

- **Endpoint**: `POST /api/v1/search`
- **Payload**:
  ```json
  {
    "query": "system architecture overview",
    "topK": 5,
    "collectionName": "enterprise_knowledge"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "query": "system architecture overview",
      "totalMatches": 5,
      "executionTimeMs": 45,
      "results": [
        {
          "score": 0.8924,
          "chunkId": "chk_1",
          "documentId": "doc_annual_report.pdf",
          "filename": "annual_report.pdf",
          "pageNumber": 1,
          "chunkIndex": 0,
          "content": "Grounded chunk content..."
        }
      ]
    }
  }
  ```

#### 2. Retrieval-Augmented Generation (RAG)

- **Endpoint**: `POST /api/v1/rag/answer`
- **Payload**:
  ```json
  {
    "question": "What is the statutory deadline for the report?",
    "topK": 5,
    "collectionName": "enterprise_knowledge"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "question": "What is the statutory deadline for the report?",
      "answer": "According to the report, the statutory deadline is 12 July 2026.",
      "confidence": 0.92,
      "sources": [
        {
          "filename": "final_report.pdf",
          "pageNumber": 1,
          "chunkId": "chk_3"
        }
      ],
      "retrievedChunks": [...]
    }
  }
  ```

---

## 🚀 Local Developer Quickstart

### 1. Prerequisites

- **Node.js**: `v20.x` or higher
- **pnpm**: `v10.x` or higher
- **Docker & Docker Compose** (to run Qdrant and other infrastructure services)
- **Ollama**: Installed locally from [ollama.com](https://ollama.com)

### 2. Start Infrastructure Containers

Start the PostgreSQL, Redis, and Qdrant backend containers:

```bash
# Navigate to infrastructure docker workspace
cd infrastructure/docker

# Copy environment template and launch services
cp .env.example .env
docker compose up -d
```

Verify that Qdrant is running locally by opening `http://localhost:6333/dashboard/` or running:

```bash
curl http://localhost:6333/collections
```

### 3. Prepare Local Inference Models

Ensure your local Ollama runtime is running, then pull the required models:

```bash
# Pull the dense embedding model
ollama pull nomic-embed-text

# Pull the chat completion model
ollama pull qwen2.5:7b
```

### 4. Install Dependencies & Build

From the root directory of the monorepo, install dependencies and compile workspaces:

```bash
# Install package dependencies
pnpm install

# Run static analysis and linting checks
pnpm lint

# Verify TypeScript type correctness across all packages
pnpm typecheck

# Build apps for production
pnpm build
```

### 5. Run Development Servers

Run the local development services:

```bash
pnpm dev
```

- **NestJS Gateway**: running at `http://localhost:4000/api/v1`
- **OpenAPI specs**: available at `http://localhost:4000/api-docs`
- **Vite React UI Client**: running at `http://localhost:3000`

---

## 🛡️ Observability, Resilience & Scalability

- **Batch Size Chunking**: Qdrant vector indexing chunks point upserts into batches of `50` elements. This prevents memory spikes and socket timeouts on documents exceeding 100 pages.
- **Async Concurrency Pools**: Chunks are mapped to embeddings in parallel batches of `4` concurrent requests, reducing Ollama inference wait times by **~70%**.
- **Dimension Mismatch Protection**: If a collection in Qdrant exists with a different vector size (e.g. from tests or model changes), `QdrantProvider` automatically re-creates it with the correct dimension.
- **Service Timeout Guardrails**:
  - Ollama timeout: `120s` (to prevent timeouts during deep document embedding tasks).
  - Qdrant timeout: `60s` (to handle heavy batch indexing writes).

---

## 🌿 Branch & Commit Standards

We enforce Conventional Commits format to maintain clean release history logs:

```text
<type>(<scope>): <subject>
```

- **`feat`**: New application feature (e.g., `feat(rag): add confidence score calculation`)
- **`fix`**: Bug resolution (e.g., `fix(api): handle missing embedding arrays in search query`)
- **`docs`**: Documentation changes (`docs: update project architecture details`)
- **`refactor`**: Internal code cleaning with no public API changes (`refactor(api): consolidate provider interfaces`)
