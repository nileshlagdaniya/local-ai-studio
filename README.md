# Local AI Studio

> **Local-first AI automation platform** — Run AI workflows entirely on your hardware with zero external dependencies.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-20%2B-green.svg)](https://nodejs.org/)
[![Python](https://img.shields.io/badge/Python-3.12%2B-blue.svg)](https://python.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115%2B-teal.svg)](https://fastapi.tiangolo.com/)

## Overview

Local AI Studio is a modular, local-first AI automation platform designed to run on consumer hardware (8 GB RAM). It provides a unified interface for AI-powered workflows across multiple domains:

- 🎨 **AI Stock Content Factory** — Generate stock photos, videos, and metadata
- 📺 **YouTube Content Factory** — Script writing, thumbnail generation, upload automation
- 📱 **Social Media Automation** — Content scheduling, cross-posting, engagement
- 📄 **Business Document Automation** — Contracts, reports, proposals generation
- 💻 **AI Developer Assistant** — Code generation, review, documentation
- 🧠 **Personal Knowledge Base** — RAG-based Q&A, note organization

All data stays local. External APIs (FreeLLMAPI) are optional fallbacks for heavy inference.

## Architecture

```
local-ai-studio/
├── apps/
│   ├── web/          # Next.js 15 frontend (React 19, Tailwind v4)
│   └── api/          # FastAPI backend (Python 3.12, SQLAlchemy 2.x)
├── packages/
│   └── api-client/   # Generated TypeScript API client
├── docs/             # Architecture & ADRs
├── scripts/          # Development scripts
├── data/             # SQLite database (gitignored)
├── storage/          # Generated files (gitignored)
└── logs/             # Runtime logs (gitignored)
```

### Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 15, React 19, TypeScript, Tailwind CSS v4, shadcn/ui, TanStack Query, Zustand |
| **Backend** | FastAPI, Pydantic v2, SQLAlchemy 2.x, Alembic, SQLite/PostgreSQL |
| **AI** | Ollama (local), FreeLLMAPI (cloud fallback) |
| **Dev** | pnpm, uv, ESLint, Prettier, Ruff, Vitest, Pytest |

## Quick Start

### Prerequisites

- **Node.js** 20+
- **pnpm** 9+ (`npm install -g pnpm`)
- **Python** 3.12+
- **uv** (`pip install uv`)
- **Ollama** ([ollama.ai](https://ollama.ai/))
- **Git**

### Installation

```bash
# Clone repository
git clone https://github.com/nileshlagdaniya/local-ai-studio.git
cd local-ai-studio

# Run setup script (PowerShell)
./scripts/dev-setup.ps1

# Or manual setup:
# 1. Install Node dependencies
pnpm install

# 2. Install Python dependencies
cd apps/api && uv sync --dev && cd ../..

# 3. Copy environment files
cp .env.example .env
cp apps/api/.env.example apps/api/.env

# 4. Pull Ollama models
ollama pull qwen2.5-coder:3b
ollama pull qwen2.5-coder:7b
```

### Development

```bash
# Start all services (frontend + backend)
pnpm dev:all

# Or individually:
pnpm dev          # Frontend only (http://localhost:3000)
pnpm dev:api      # Backend only (http://localhost:8000)
```

### Useful Commands

```bash
# Linting & Formatting
pnpm lint         # Lint all packages
pnpm format       # Format all packages
pnpm typecheck    # Type check all packages

# Testing
pnpm test         # Run all tests
pnpm test:web     # Frontend tests only
pnpm test:api     # Backend tests only

# Database
pnpm db:migrate   # Create new migration
pnpm db:upgrade   # Apply migrations
pnpm db:downgrade # Rollback migration

# Building
pnpm build        # Build all packages
pnpm build:web    # Build frontend
pnpm build:api    # Build backend
```

## Project Structure

### Frontend (`apps/web`)

```
apps/web/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (auth)/             # Auth route group
│   │   ├── (dashboard)/        # Dashboard route group
│   │   │   ├── modules/        # Module pages
│   │   │   └── settings/       # Settings pages
│   │   ├── api/                # API routes (proxy to backend)
│   │   ├── globals.css         # Tailwind v4 + CSS variables
│   │   └── layout.tsx          # Root layout
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── module/             # Module-specific components
│   │   ├── layout/             # Sidebar, header, navigation
│   │   ├── ai/                 # AI streaming components
│   │   └── forms/              # Form components (RHF + Zod)
│   ├── lib/
│   │   ├── api/                # API client (TanStack Query)
│   │   ├── ai/                 # AI gateway client
│   │   ├── hooks/              # Custom React hooks
│   │   ├── utils/              # Utility functions
│   │   └── validations/        # Zod schemas
│   ├── providers/              # React context providers
│   ├── store/                  # Zustand stores
│   └── types/                  # TypeScript types
```

### Backend (`apps/api`)

```
apps/api/
├── src/
│   ├── main.py                 # FastAPI app factory
│   ├── config/                 # Settings & logging
│   ├── api/
│   │   ├── routes/             # API endpoints
│   │   ├── deps.py             # FastAPI dependencies
│   │   └── middleware.py       # Custom middleware
│   ├── core/
│   │   ├── ai_gateway/         # AI provider abstraction
│   │   ├── jobs/               # Background job processor
│   │   ├── storage/            # File storage abstraction
│   │   └── database/           # SQLAlchemy models & session
│   ├── modules/                # Business logic modules
│   │   ├── base.py             # Base module class
│   │   ├── registry.py         # Module registry
│   │   └── stock_content_factory/
│   └── shared/                 # Shared utilities
```

## Configuration

### Environment Variables

| File | Purpose |
|------|---------|
| `.env` | Root/frontend config |
| `apps/api/.env` | Backend config |

Key backend settings:

```bash
# Database
DATABASE_URL="sqlite+aiosqlite:///./data/local_ai_studio.db"

# Ollama (local LLM)
OLLAMA_BASE_URL="http://localhost:11434"
OLLAMA_DEFAULT_MODEL="qwen2.5-coder:3b"

# FreeLLMAPI (cloud fallback)
FREELLM_API_KEY="your-key-here"
FREELLM_API_DEFAULT_MODEL="gpt-4o-mini"

# Storage
STORAGE_ROOT="./data/storage"
```

## Resource Constraints

Designed for **8 GB RAM** laptops:

- **Default model**: `qwen2.5-coder:3b` (~1.9 GB RAM)
- **Heavy tasks**: `qwen2.5-coder:7b` (~4.7 GB) — use sparingly
- **Concurrent AI requests**: 1 (sequential job queue)
- **No Docker, Redis, Kubernetes** — zero infrastructure overhead
- **Caches on F: drive** — preserves C: space

## Documentation

- [System Overview](docs/architecture/system-overview.md)
- [Frontend Architecture](docs/architecture/frontend-architecture.md)
- [Backend Architecture](docs/architecture/backend-architecture.md)
- [Database Architecture](docs/architecture/database-architecture.md)
- [AI Provider Architecture](docs/architecture/ai-provider-architecture.md)
- [ADR-001: Tech Stack](docs/decisions/ADR-001-tech-stack.md)
- [ADR-002: Database](docs/decisions/ADR-002-database.md)
- [ADR-003: Job Processing](docs/decisions/ADR-003-job-processing.md)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards

- **TypeScript**: Strict mode, no `any`
- **Python**: Type hints required, Ruff for linting
- **Commits**: Conventional commits (`feat:`, `fix:`, `docs:`, etc.)
- **PRs**: Must pass CI (lint, typecheck, tests)

## Security

See [SECURITY.md](SECURITY.md) for vulnerability reporting and security practices.

## License

MIT License — see [LICENSE](LICENSE) for details.

## Acknowledgments

- [Ollama](https://ollama.ai/) for local LLM inference
- [FreeLLMAPI](https://freellmapi.xyz/) for free cloud LLM access
- [shadcn/ui](https://ui.shadcn.com/) for beautiful components
- [Next.js](https://nextjs.org/) and [FastAPI](https://fastapi.tiangolo.com/) teams