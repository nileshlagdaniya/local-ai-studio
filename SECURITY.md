# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 0.1.x (development) | ✅ Active development |

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via email to: **security@nileshlagdaniya.com**

Include the following information:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

We will acknowledge receipt within 48 hours and provide a timeline for a fix.

## Security Practices

### Local-First Design

Local AI Studio is designed with a **local-first architecture**:

- **No data leaves your machine** unless you explicitly configure cloud AI providers
- **SQLite database** stores all data locally in `data/`
- **File storage** in `storage/` — never uploaded automatically
- **No telemetry** — no usage data sent to external servers

### AI Provider Security

#### Ollama (Local)

- Runs entirely on localhost (`http://localhost:11434`)
- No authentication required (local only)
- Models stored in Ollama's local directory
- Network access disabled by default

#### FreeLLMAPI (Cloud Fallback)

- **Optional** — only used if explicitly configured
- API key stored in environment variable (`FREELLM_API_KEY`)
- Requests sent over HTTPS
- No request logging on our side

### Authentication & Authorization

- **JWT tokens** for API authentication (HS256)
- **Secret key** must be changed in production (`SECRET_KEY` env var)
- **Password hashing** with bcrypt (via passlib)
- **CORS** restricted to configured origins only

### Environment Variables

**Never commit these files:**
- `.env`
- `.env.local`
- `.env.production`
- `apps/api/.env`

**Always use `.env.example` templates** and fill in locally.

### Data Protection

| Data Type | Storage | Encryption |
|-----------|---------|------------|
| User accounts | SQLite | Passwords bcrypt-hashed |
| API keys | Environment variables | Not stored in DB |
| Generated content | Local filesystem | None (local only) |
| AI usage logs | SQLite | None (local only) |
| Job metadata | SQLite | None (local only) |

### Network Security

- **Backend API** binds to `0.0.0.0:8000` by default (change in production)
- **Frontend** runs on `localhost:3000`
- **Ollama** runs on `localhost:11434`
- **No external database** connections in default config
- **HTTPS** required for production (use reverse proxy)

### Dependency Security

- **pnpm audit** for Node.js dependencies
- **uv pip audit** for Python dependencies
- **Dependabot** alerts enabled on GitHub
- **Lock files committed** (`pnpm-lock.yaml`, `uv.lock`)

### Development Practices

- **No hardcoded secrets** — all via environment variables
- **Input validation** via Pydantic (backend) and Zod (frontend)
- **SQL injection prevention** via SQLAlchemy ORM
- **XSS prevention** via React's automatic escaping
- **CSRF protection** via SameSite cookies + JWT

## Production Deployment Checklist

Before deploying to production:

- [ ] Change `SECRET_KEY` to a strong random value (32+ chars)
- [ ] Set `DEBUG=false`
- [ ] Configure `CORS_ORIGINS` to your domain only
- [ ] Use PostgreSQL instead of SQLite
- [ ] Enable HTTPS (reverse proxy with TLS)
- [ ] Set up database backups
- [ ] Configure log aggregation
- [ ] Review and restrict file upload limits
- [ ] Enable rate limiting (consider adding)
- [ ] Set up monitoring/alerting

## Known Limitations

1. **Single-user design** — Multi-tenancy not implemented
2. **No rate limiting** — Add reverse proxy (nginx) for production
3. **SQLite concurrency** — Single writer; use PostgreSQL for multi-user
4. **No audit logging** — Add for compliance requirements
5. **File upload validation** — Basic MIME type checking only

## Security Updates

Security patches will be released as patch versions (0.1.x). Subscribe to GitHub releases for notifications.

## Contact

For security concerns: **security@nileshlagdaniya.com**

For general questions: Open a GitHub Discussion.