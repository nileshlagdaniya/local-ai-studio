# ADR-001: Technology Stack Selection

**Status:** Accepted  
**Date:** 2026-11-24  
**Deciders:** Principal Software Architect  
**Technical Story:** Select the complete technology stack for Local AI Studio

## Context

Local AI Studio is a local-first, modular AI automation platform targeting 8 GB RAM laptops. The platform must support multiple AI-driven modules (content factories, social media, document automation, developer assistant, knowledge base) while remaining lightweight, type-safe, and developer-friendly.

Key constraints:
- 8 GB RAM total (≈6 GB usable)
- No Docker, Redis, Kubernetes
- Local-first with optional cloud AI fallback
- Single developer workflow initially
- Future PostgreSQL migration path required

## Decision

### Frontend Stack

| Technology | Version | Rationale |
|------------|---------|-----------|
| **Next.js** | 15.x (App Router) | React 19 ready, Server Components, streaming, Turbopack |
| **React** | 19 | Latest stable, concurrent features, better hydration |
| **TypeScript** | 5.x | Strict mode, inference, developer velocity |
| **Tailwind CSS** | v4 | Zero-runtime, modern CSS, OKLCH, native cascade layers |
| **shadcn/ui** | Latest | Accessible, customizable, copy-paste (no dependency) |
| **TanStack Query** | 5.x | Server state, caching, mutations, streaming support |
| **React Hook Form** | 7.x | Performant, minimal re-renders |
| **Zod** | 3.x | Schema validation, TypeScript inference |
| **Zustand** | 4.x | Minimal client state, only when needed |
| **Lucide React** | Latest | Consistent icons, tree-shakeable |
| **Sonner** | Latest | Toast notifications, accessible |
| **Recharts** | 2.x | React-native charts, lightweight |

### Backend Stack

| Technology | Version | Rationale |
|------------|---------|-----------|
| **Python** | 3.12 | Modern, fast, great async support |
| **FastAPI** | 0.115+ | Async, automatic OpenAPI, Pydantic native |
| **Pydantic** | v2 | Rust-backed, fast, JSON Schema, validation |
| **Pydantic Settings** | 2.x | Environment-based config, type-safe |
| **SQLAlchemy** | 2.0+ | Async, modern ORM patterns, 2.0 style |
| **Alembic** | 1.13+ | Version-controlled migrations |
| **SQLite** | 3.x | Zero-config, file-based, portable |
| **HTTPX** | 0.28+ | Async/sync HTTP client, HTTP/2 |
| **aiosqlite** | 0.20+ | Async SQLite driver |

### Development Stack

| Technology | Version | Rationale |
|------------|---------|-----------|
| **pnpm** | 9.x | Fast, disk-efficient, monorepo workspaces |
| **uv** | 0.4+ | 10-100x faster than pip, universal Python tooling |
| **ESLint** | 9.x | Flat config, TypeScript-aware |
| **Prettier** | 3.x | Consistent formatting |
| **Ruff** | 0.7+ | Fast Python linter/formatter (replaces flake8/black/isort) |
| **Vitest** | 2.x | Vite-native, fast, Jest-compatible |
| **Pytest** | 8.x | Standard Python testing, fixtures, plugins |
| **GitHub Actions** | Latest | Native CI/CD, matrix builds |

### Infrastructure (Local)

| Technology | Version | Rationale |
|------------|---------|-----------|
| **Ollama** | 0.40+ | Local LLM server, model management, REST API |
| **FreeLLMAPI** | - | Free cloud LLM fallback |

## Alternatives Considered

### Frontend

| Alternative | Rejected Because |
|-------------|------------------|
| **Vite + SPA** | No SSR/streaming, worse SEO, no Server Components |
| **Remix** | Smaller ecosystem, React Router v7 migration uncertainty |
| **Astro** | Island architecture not needed, less AI streaming support |
| **Chakra UI / MUI** | Heavy runtime, less customizable, larger bundles |
| **SWR** | Less powerful than TanStack Query for mutations/caching |
| **Formik / Yup** | Slower, more boilerplate than RHF + Zod |
| **Redux / Jotai** | Overkill; Zustand sufficient for minimal client state |

### Backend

| Alternative | Rejected Because |
|-------------|------------------|
| **Django / DRF** | Heavy, sync-first, slower for AI streaming |
| **FastAPI + Pydantic v1** | v2 is significantly faster, better types |
| **SQLModel** | Adds abstraction over SQLAlchemy; use SQLAlchemy 2.x directly |
| **Tortoise ORM** | Less mature, fewer migration tools |
| **PostgreSQL locally** | Heavy, requires Docker/service, overkill for 8 GB |
| **Redis + Celery** | Infrastructure overhead, not needed for sequential jobs |
| **GraphQL (Strawberry)** | Overkill; REST + OpenAPI sufficient |

### Development

| Alternative | Rejected Because |
|-------------|------------------|
| **npm / yarn** | Slower, larger node_modules, no native monorepo |
| **pip / poetry** | Slower than uv; uv replaces both |
| **Turborepo** | Optional; pnpm workspaces sufficient initially |
| **Nx** | Heavy, steep learning curve |

## Consequences

### Positive

- **End-to-end type safety**: TypeScript → OpenAPI → Pydantic → SQLAlchemy
- **Local-first**: Zero external dependencies for development
- **Performance**: Fast tooling (uv, pnpm, Ruff, Vite/Turbopack)
- **Developer experience**: Hot reload, great debugging, auto-generated docs
- **Future-proof**: PostgreSQL migration path, module architecture
- **Resource-aware**: Designed for 8 GB RAM constraints

### Negative

- **Learning curve**: Multiple new technologies (Tailwind v4, Pydantic v2, SQLAlchemy 2.x)
- **Next.js 15 App Router**: Paradigm shift from Pages Router
- **Pydantic v2 migration**: Breaking changes from v1
- **SQLite limitations**: No concurrent writes, limited JSON indexing (mitigated by design)

### Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Next.js 15 instability | Pin to stable release; test thoroughly |
| Pydantic v2 ecosystem gaps | Use v2-native libraries; contribute fixes |
| SQLite concurrency | Single-writer design; job queue serializes |
| Model memory | Default to 3B models; 7B on-demand only |
| FreeLLMAPI reliability | Circuit breaker; graceful degradation |

## Implementation Notes

1. **Monorepo**: pnpm workspaces + uv workspace (separate package.json / pyproject.toml)
2. **Shared types**: `packages/shared` with Zod/Pydantic schemas, codegen for API client
3. **Environment config**: `.env` files per app, validated by Pydantic Settings / Zod
4. **CI pipeline**: Lint → Typecheck → Test → Build for both frontend and backend

## References

- [Next.js 15 Documentation](https://nextjs.org/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Pydantic v2 Migration Guide](https://docs.pydantic.dev/latest/concepts/migration/)
- [SQLAlchemy 2.0 Tutorial](https://docs.sqlalchemy.org/en/20/tutorial/index.html)
- [Tailwind CSS v4 Documentation](https://tailwindcss.com/docs)
- [uv Documentation](https://docs.astral.sh/uv/)