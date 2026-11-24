# Git Workflow Rules

## Branch Naming

| Type | Prefix | Example |
|------|--------|---------|
| Feature | `feature/` | `feature/stock-content-generator` |
| Fix | `fix/` | `fix/job-queue-memory-leak` |
| Refactor | `refactor/` | `refactor/ai-gateway-streaming` |
| Docs | `docs/` | `docs/update-api-docs` |
| Chore | `chore/` | `chore/update-dependencies` |

## Commit Messages

Follow Conventional Commits:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat:` — New feature
- `fix:` — Bug fix
- `docs:` — Documentation only
- `style:` — Formatting, no code change
- `refactor:` — Code change, no behavior change
- `test:` — Adding tests
- `chore:` — Maintenance, deps, config

### Examples

```
feat(ai): add streaming support for FreeLLMAPI

Add AsyncGenerator support for token-by-token streaming.
Update SSE endpoint to handle both providers.

Closes #42
```

```
fix(jobs): prevent memory leak in job queue

Clear completed jobs cache after TTL expires.
Add periodic cleanup task.

Fixes #15
```

## Pull Requests

### Requirements

- [ ] Branch from `main`
- [ ] Descriptive title and description
- [ ] Linked issue (if applicable)
- [ ] All CI checks passing
- [ ] At least one approval
- [ ] No merge conflicts

### Template

```markdown
## Summary
Brief description of changes.

## Changes
- Change 1
- Change 2

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing done

## Screenshots (if UI)
...

## Checklist
- [ ] No hardcoded secrets
- [ ] .env.example updated if needed
- [ ] Migrations included if schema changed
- [ ] Documentation updated
```

## Merge Strategy

- **Squash and merge** for feature branches
- **Rebase and merge** for small fixes
- **No direct pushes** to `main`
- **Delete branch** after merge

## Versioning

- **Semantic versioning**: MAJOR.MINOR.PATCH
- **Tag releases**: `v0.1.0`, `v0.2.0`
- **Changelog**: Auto-generated from commits (future)

---

**References:** Root `CLAUDE.md`