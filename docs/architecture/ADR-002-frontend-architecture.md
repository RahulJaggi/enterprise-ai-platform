# ADR-002: Frontend Architecture

- **Status**: Accepted
- **Date**: 2026-07-22
- **Authors**: Frontend Architecture Team
- **Deciders**: Principal Architect, Frontend Lead

---

## Context

The enterprise platform requires a modern, responsive web application capable of handling real-time AI response streaming (Server-Sent Events / WebSockets), interactive agent builder visualizers, document ingestion status dashboards, and complex enterprise administrative workflows.

---

## Decision

We decide to standardize the web portal (`apps/web`) on **Next.js 15 (App Router)**, **React 19**, **TypeScript**, and **Vanilla CSS / Tailwind CSS**.

---

## Alternatives Considered

1. **Single Page Application (Vite + React SPA)**:
   - _Rejected_: Lacks built-in Server-Side Rendering (SSR), native API route integration, and optimized Server Components for administrative content.
2. **Remix / React Router v7**:
   - _Rejected_: Next.js 15 provides stronger enterprise ecosystem alignment, broader middleware support, and native React Server Components integration.
3. **Angular / Vue**:
   - _Rejected_: Team expertise and existing ecosystem of AI React UI component primitives favor React 19.

---

## Pros

- **React Server Components (RSC)**: Reduces client-side JavaScript bundle sizes by rendering non-interactive pages on the server.
- **Real-Time Streaming**: Native support for readable streams, WebSockets, and SSE for streaming LLM responses.
- **Type-Safe Integration**: Direct consumption of shared DTOs from `@enterprise-ai/types` and components from `@enterprise-ai/ui`.
- **SEO & Accessibility**: Built-in routing, metadata management, and server-side rendering for administrative portals.

---

## Cons

- Learning curve associated with Server Components vs Client Components boundaries (`"use client"`).
- Potential hydration mismatches if server and client state differ during dynamic rendering.

---

## Consequences

- All client-side UI components reside under `@enterprise-ai/ui` or `apps/web/app`.
- Layout components enforce dark/light theme consistency and accessibility guidelines.

---

## Future Improvements

- Evaluation of micro-frontend architecture if enterprise administrative portals split across independent business domains.
- Storybook integration for component visual testing.
