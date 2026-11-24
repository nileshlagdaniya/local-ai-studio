# AI Provider Rules

## Scope

Applies to: `apps/api/src/core/ai_gateway/**`, `apps/api/src/api/routes/ai.py`

## Rules

### Provider Abstraction

- All AI providers must implement `AIProvider` abstract base class
- Use `ProviderRegistry` for provider management
- Use `AIGateway` facade for all AI operations
- Never call provider implementations directly

### Streaming

- Default to streaming (`stream=true`) for all generation
- Use `AsyncGenerator[StreamChunk, None]` for streaming responses
- Convert to SSE in API routes: `StreamingResponse(generator, media_type="text/event-stream")`
- Handle `[DONE]` sentinel properly

### Model Selection

- Default to `qwen2.5-coder:3b` (Ollama) for local inference
- Use `gpt-4o-mini` (FreeLLMAPI) for cloud fallback
- 7B+ models require explicit user opt-in
- Never load multiple models simultaneously

### Resource Constraints

- **Max concurrent requests**: 1 (enforced by job queue)
- **Timeouts**: Ollama 300s, FreeLLMAPI 120s
- **Context length**: Respect model limits (4096 default)
- **Memory**: Monitor usage; offload to FreeLLMAPI if > 6 GB

### Error Handling

- Provider errors wrapped in `APIError(502, "Provider unavailable")`
- Health checks at startup and on demand
- Graceful degradation: if Ollama fails, try FreeLLMAPI
- Log all errors with `request_id` for tracing

### Metrics

- Record usage: tokens, latency, cost per request
- Store in `ai_usage_logs` table
- Include: `user_id`, `provider`, `model`, `request_type`
- Alert on cost thresholds (future)

---

**References:** `docs/architecture/ai-provider-architecture.md`, `apps/api/CLAUDE.md`