# Local AI Studio — Claude Code Instructions

## Project Purpose

Local-first, modular AI automation platform running on 8 GB RAM laptops. Supports multiple AI-driven modules (content factories, social media, document automation, developer assistant, knowledge base) with zero external infrastructure dependencies.

## Monorepo Structure

```
local-ai-studio/
├── apps/
│   ├── web/          # Next.js 16 frontend (React 19, Tailwind v4)
│   └── api/          # FastAPI backend (Python 3.12, SQLAlchemy 2.x)
├── packages/
│   └── api-client/   # Generated TypeScript API client
├── docs/
│   ├── architecture/ # System design docs
│   └── decisions/    # ADRs
├── scripts/          # Development scripts
├── data/             # SQLite database (gitignored)
├── storage/          # Generated files (gitignored)
└── logs/             # Runtime logs (gitignored)
```

## Technology Stack

| Layer | Stack |
|-------|-------|
| Frontend | Next.js 16, React 19, TypeScript 5.x, Tailwind CSS v4, shadcn/ui, TanStack Query 5, Zustand, React Hook Form, Zod |
| Backend | FastAPI, Pydantic v2, SQLAlchemy 2.x, Alembic, SQLite/PostgreSQL, HTTPX |
| AI | Ollama (local), FreeLLMAPI (cloud fallback) |
| Dev | pnpm 9, uv 0.4+, ESLint 9, Prettier 3, Ruff 0.7, Vitest 2, Pytest 8 |

## Architecture Principles

1. **Local-first**: All data stored locally; external APIs only for LLM inference
2. **Modular**: Each feature domain is an independent module with clear boundaries
3. **Resource-aware**: Designed for 8 GB RAM; no Docker, Redis, or heavy infra
4. **Type-safe**: End-to-end TypeScript + Pydantic v2 contracts
5. **Future-ready**: PostgreSQL migration path; deployment-ready structure
6. **Sequential AI**: One LLM request at a time (memory constraint)

## Coding Standards

### General
- **No `any`** without documented justification (use `// any: <reason>`)
- **No `@ts-ignore`** to hide problems
- **No hardcoded secrets** — use environment variables
- **No committing .env files** — `.env*` in `.gitignore`
- **Conventional commits**: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`

### Frontend (see `apps/web/CLAUDE.md`)
- Server Components by default; Client Components only when necessary
- Tailwind CSS v4 only (no v3 syntax)
- shadcn/ui patterns for all components
- Zod for all validation

### Backend (see `apps/api/CLAUDE.md`)
- Pydantic v2 for all schemas
- Repository pattern for data access
- Service layer for business logic
- Async/await throughout

## Git Workflow

- **Branch**: `feature/<name>`, `fix/<name>`, `refactor/<name>`
- **Commit**: Conventional format, signed off
- **PR**: Required for all changes to main
- **Review**: At least one approval required
- **CI**: Must pass (lint, typecheck, tests)

## Security Requirements

- Never log API keys, tokens, or passwords
- JWT secret via `SECRET_KEY` env var (32+ chars in production)
- CORS restricted to configured origins
- Input validation via Zod (frontend) and Pydantic (backend)
- Passwords: bcrypt via passlib
- File uploads: MIME type validation, size limits

## Testing Requirements

| Type | Tool | Coverage Target |
|------|------|-----------------|
| Unit (frontend) | Vitest | ≥ 80% |
| Unit (backend) | Pytest | ≥ 80% |
| Integration | Vitest + Pytest | Critical paths |
| E2E | Playwright (future) | User flows |

Run tests before committing: `pnpm test`

## Environment Management

| File | Purpose | Committed |
|------|---------|-----------|
| `.env.example` | Template | ✅ Yes |
| `.env` | Local overrides | ❌ No |
| `apps/api/.env.example` | Backend template | ✅ Yes |
| `apps/api/.env` | Backend local | ❌ No |

Use `pnpm run dev-setup` for initial configuration.

## Performance Requirements

- **Cold start**: < 3 seconds (frontend + backend)
- **API latency (local)**: < 100 ms p95
- **AI streaming**: First token < 500 ms (local)
- **Bundle size**: < 200 KB gzipped (initial)
- **Memory (idle)**: < 500 MB total
- **Memory (inference)**: < 6 GB with 7B model loaded

## Development Workflow

```bash
# Start all services
pnpm dev:all

# Frontend only
pnpm dev

# Backend only
pnpm dev:api

# Lint + typecheck + test
pnpm lint && pnpm typecheck && pnpm test

# Database migrations
pnpm db:migrate "description"
pnpm db:upgrade
```

## Verification Commands

```bash
# Check loaded instructions
/memory
/context

# Verify skills
/skill frontend-development
/skill backend-development
```

---

**Key References:**
- `apps/web/CLAUDE.md` — Frontend-specific rules
- `apps/api/CLAUDE.md` — Backend-specific rules
- `docs/architecture/*.md` — Architecture docs
- `docs/decisions/ADR-*.md` — Architecture decisions
- `.claude/skills/*/SKILL.md` — Development skills