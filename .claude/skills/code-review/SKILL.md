# Code Review Skill

## Overview

This skill provides a comprehensive checklist for reviewing code changes in Local AI Studio.

## Security Review

### Secrets & Credentials

- [ ] **No hardcoded secrets** — API keys, passwords, tokens in source
- [ ] **No `.env` files** committed — check `.gitignore`
- [ ] **Environment variables** used for all configuration
- [ ] **JWT secret** not in code — from `SECRET_KEY` env var
- [ ] **Database URLs** not in code — from `DATABASE_URL` env var

### Input Validation

- [ ] **All request bodies** validated via Pydantic (backend) / Zod (frontend)
- [ ] **Extra fields forbidden** — `extra="forbid"` / `z.object().strict()`
- [ ] **File uploads** validated: MIME type, size, extension
- [ ] **Path traversal** prevented — sanitize filenames
- [ ] **SQL injection** prevented — SQLAlchemy ORM, no raw SQL

### Authentication & Authorization

- [ ] **Auth required** on protected endpoints
- [ ] **Role checks** where applicable
- [ ] **Resource ownership** verified (user can only access their data)
- [ ] **CORS** restricted to configured origins
- [ ] **Rate limiting** considered for public endpoints

### Data Protection

- [ ] **Passwords** hashed with bcrypt (never plaintext)
- [ ] **PII** not logged — use `mask_secret()` utility
- [ ] **API keys** masked in logs
- [ ] **HTTPS** enforced in production

## Performance Review

### Database

- [ ] **N+1 queries** avoided — use `selectinload`/`joinedload`
- [ ] **Indexes** exist for query patterns
- [ ] **Pagination** implemented for list endpoints
- [ ] **Bulk operations** used for multiple inserts/updates
- [ ] **Connection pooling** configured appropriately

### Frontend

- [ ] **Server Components** used by default
- [ ] **Client Components** minimal and focused
- [ ] **Dynamic imports** for heavy features
- [ ] **TanStack Query** for caching (no duplicate requests)
- [ ] **Images** optimized with `next/image`
- [ ] **Fonts** loaded with `next/font`
- [ ] **Bundle size** within targets (< 200 KB initial)

### AI Operations

- [ ] **Streaming** used for long responses
- [ ] **Model selection** appropriate (3B default, 7B on demand)
- [ ] **Concurrent requests** limited to 1 (8 GB constraint)
- [ ] **Timeouts** configured on all external calls

### Caching

- [ ] **TanStack Query** `staleTime` configured
- [ ] **HTTP caching** headers where appropriate
- [ ] **Redis** not used (by design) — in-memory only

## Type Safety

### TypeScript (Frontend)

- [ ] **No `any`** without `// any: <reason>` comment
- [ ] **No `@ts-ignore`** or `@ts-expect-error`
- [ ] **Strict mode** enabled in `tsconfig.json`
- [ ] **Props interfaces** defined for all components
- [ ] **API types** generated from OpenAPI or shared package
- [ ] **Zod schemas** infer types: `z.infer<typeof schema>`

### Python (Backend)

- [ ] **Type hints** on all functions/methods
- [ ] **Pydantic v2** `ConfigDict` on all models
- [ ] **`Mapped`** annotations on SQLAlchemy models
- [ ] **Generic repositories** with `TypeVar`
- [ ] **No `Any`** without justification
- [ ] **Mypy** passes: `uv run mypy src/`

## Code Duplication

### DRY Principles

- [ ] **Shared utilities** in `lib/utils.ts` / `shared/utils.py`
- [ ] **Common components** in `components/ui/` / `shared/`
- [ ] **Shared types** in `packages/api-client` or `types/`
- [ ] **Configuration** centralized in Settings
- [ ] **Constants** in `lib/constants.ts` / `shared/constants.py`

### Patterns to Eliminate

- Repeated validation logic → shared Zod/Pydantic schemas
- Repeated API calls → TanStack Query hooks / service methods
- Repeated UI patterns → shadcn/ui components
- Repeated DB queries → repository methods

## Test Coverage

### Requirements

- [ ] **Unit tests** for new business logic
- [ ] **Repository tests** for data access
- [ ] **Service tests** for AI integrations (mocked)
- [ ] **API tests** for new endpoints
- [ ] **Component tests** for complex UI

### Quality

- [ ] **Tests pass** — run `pnpm test` / `uv run pytest`
- [ ] **Coverage** ≥ 80% for new code
- [ ] **Edge cases** covered (empty, error, boundary)
- [ ] **Async tests** use `pytest_asyncio` / Vitest async
- [ ] **Mocks** for external dependencies (Ollama, FreeLLMAPI)

### CI Integration

- [ ] Tests run in GitHub Actions
- [ ] Coverage reported
- [ ] No flaky tests

## Accessibility (Frontend)

### WCAG AA Checklist

- [ ] **Semantic HTML** — `<button>`, `<nav>`, `<main>`, `<section>`
- [ ] **Focus visible** — `focus-visible:ring-2`
- [ ] **Color contrast** — 4.5:1 normal, 3:1 large
- [ ] **ARIA labels** — `aria-label`, `aria-describedby`
- [ ] **Keyboard navigation** — all interactive elements reachable
- [ ] **Screen readers** — `sr-only` for hidden labels
- [ ] **Reduced motion** — `@media (prefers-reduced-motion)`
- [ ] **Form labels** — `<label htmlFor>` associated with inputs

### Testing

- [ ] **axe-core** or similar in CI (future)
- [ ] **Manual testing** with screen reader (NVDA/VoiceOver)

## Regression Risks

### High-Risk Areas

- [ ] **Database migrations** — test upgrade/downgrade
- [ ] **Auth changes** — verify all protected routes
- [ ] **AI provider changes** — test both Ollama and FreeLLMAPI
- [ ] **Job queue changes** — verify sequential execution
- [ ] **File storage changes** — verify upload/download
- [ ] **Configuration changes** — verify all env vars

### Breaking Changes

- [ ] **API contract** — OpenAPI spec updated
- [ ] **Database schema** — migration provided
- [ ] **Environment variables** — `.env.example` updated
- [ ] **Component props** — backward compatible or migration guide

### Rollback Plan

- [ ] Migration has `downgrade()`
- [ ] Feature flag for quick disable
- [ ] Database backup before deploy

## Review Process

### Pre-Review (Author)

- [ ] Self-review with this checklist
- [ ] Tests passing locally
- [ ] Linting clean: `pnpm lint` / `uv run ruff check`
- [ ] Typecheck clean: `pnpm typecheck` / `uv run mypy src/`
- [ ] Commit messages conventional

### During Review (Reviewer)

- [ ] Read all changed files
- [ ] Run tests locally if complex
- [ ] Check for security issues first
- [ ] Verify type safety
- [ ] Check performance implications
- [ ] Leave actionable comments

### Post-Review

- [ ] All comments addressed
- [ ] CI passes
- [ ] Approved by at least one reviewer
- [ ] Merged via PR (not direct push)

## Guardrails Enforcement

### Never Allow

- [ ] Hardcoded secrets
- [ ] Committed `.env` files
- [ ] Silent schema modifications
- [ ] Removed features without approval
- [ ] Stack changes without ADR
- [ ] Tailwind v3 syntax
- [ ] Oversized components (> 300 lines)
- [ ] Unjustified `any` types
- [ ] Suppressed TypeScript errors
- [ ] Untested code claimed working

### Always Require

- [ ] Environment variable for config
- [ ] Migration for schema changes
- [ ] Tests for new logic
- [ ] Type hints on new functions
- [ ] Documentation for new APIs

---

**Reference:** Root `CLAUDE.md`, `apps/web/CLAUDE.md`, `apps/api/CLAUDE.md`