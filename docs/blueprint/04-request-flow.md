# 04 - Request Flow Blueprint

## Purpose

This document maps the complete end-to-end HTTP, WebSocket, and streaming request lifecycle from client interaction through the API Gateway, processing pipelines, and data stores.

---

## Architecture

Request handling utilizes NestJS middleware pipeline processing:

```text
[Client Request]
       |
       v
[Cors Middleware] -> [Rate Limiter] -> [Auth Guard] -> [RBAC Guard]
       |
       v
[Validation Pipe] -> [Controller Handler] -> [Service UseCase]
       |
       v
[Response Interceptor] -> [JSON Envelope / SSE Stream] -> [Client Response]
```

---

## Responsibilities

- **Request Sanitization**: Intercepts malicious inputs, strips dangerous scripts, and enforces payload length limits.
- **Context Injection**: Attaches validated principal info (`userId`, `tenantId`, `roles`, `correlationId`) to the execution context.
- **Streaming Pipeline**: Manages Server-Sent Events (SSE) for streaming model tokens back to the web portal without buffering.

---

## Dependencies

- NestJS Interceptors & Guards.
- Redis Rate Limiter Store.
- OpenTelemetry Trace Context Propagator.

---

## Sequence Flow

```mermaid
sequenceDiagram
    autonumber
    actor Client
    participant RateLimiter as Redis Rate Limiter
    participant AuthGuard as Auth Guard
    participant Controller as Agent Controller
    participant Service as Agent Service
    participant Stream as SSE Stream Handler

    Client->>RateLimiter: HTTP POST /api/v1/agents/execute
    alt Rate Limit Exceeded
        RateLimiter-->>Client: 429 Too Many Requests
    else Allowed
        RateLimiter->>AuthGuard: Verify Bearer Token
        alt Invalid Token
            AuthGuard-->>Client: 401 Unauthorized
        else Valid Token
            AuthGuard->>Controller: Forward Request + Principal Context
            Controller->>Service: Trigger Async Execution
            Service->>Stream: Open Readable Stream
            Stream-->>Client: HTTP 200 (text/event-stream)
            loop Streaming Tokens
                Service-->>Stream: Emits chunk ("data: token")
                Stream-->>Client: Send SSE chunk
            end
            Service-->>Stream: Close Stream ("event: end")
        end
    end
```

---

## Best Practices

- **Correlation ID Tracking**: Every request receives a `X-Correlation-ID` header injected at the gateway boundary.
- **Fail-Fast Pipe**: Invalid DTO fields rejected at the `ValidationPipe` stage prior to executing database calls.

---

## Future Extensions

- **GraphQL Subscriptions**: Alternative streaming layer alongside SSE and WebSockets.
- **Edge Gateway Filtering**: Pre-filtering malicious traffic using Cloudflare Workers or Nginx/Kong API Gateway.
