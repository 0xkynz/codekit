---
name: agents
description: Guide for working with AGENTS.md — the open standard for AI coding agent configuration. Use when creating, updating, or optimizing AGENTS.md files, or when onboarding a project to multi-agent workflows.
---

# Agents.md — Universal AI Agent Configuration

AGENTS.md is an open standard for guiding AI coding agents. It works across 25+ agents including Claude Code, GitHub Copilot, Cursor, Devin, Windsurf, Cline, Aider, and more.

## What AGENTS.md Does

- Provides a single, predictable location for project-specific AI instructions
- Works universally — any AI agent that reads markdown can use it
- Supports monorepo patterns with nested files (closest file wins)
- Complements platform-specific files (CLAUDE.md, .cursorrules, GEMINI.md)

## When to Use AGENTS.md

Use AGENTS.md as the **universal baseline** that works with any agent. Use platform-specific files for features unique to that platform:

| File | Scope | Best For |
|------|-------|----------|
| `AGENTS.md` | Universal — all AI agents | Project overview, build commands, code style, architecture, testing |
| `CLAUDE.md` | Claude Code only | Claude-specific features, memory-bank, skill references |
| `.cursorrules` | Cursor only | Cursor-specific behaviors |
| `GEMINI.md` | Gemini CLI only | Gemini-specific context |

**Rule of thumb:** If an instruction applies to *any* AI agent working on your project, put it in AGENTS.md. If it's platform-specific, put it in the platform file.

## File Structure

AGENTS.md is standard Markdown. No required schema — use headings that make sense for your project. Recommended sections:

```markdown
# Project Name

## Project Overview
[What this project does, its purpose]

## Build and Test Commands
[How to install, run, test, build]

## Tech Stack
[Languages, frameworks, runtime, package manager]

## Code Style
[Conventions: TypeScript, semicolons, quotes, formatting]

## Architecture
[Patterns, directory structure, key design decisions]

## Testing
[Test framework, coverage requirements, how to run tests]

## Dependencies
[Key packages and their purposes]

## Guidelines
[Rules for AI agents: what to do, what to avoid]
```

## Monorepo Support

In monorepos, place AGENTS.md at each package/app level. The nearest file to the code being edited takes precedence:

```
monorepo/
├── AGENTS.md              # Root-level defaults
├── packages/
│   ├── api/
│   │   └── AGENTS.md      # API-specific rules (overrides root)
│   ├── web/
│   │   └── AGENTS.md      # Web app rules (overrides root)
│   └── shared/
│       └── AGENTS.md      # Shared lib rules (overrides root)
```

## Generating AGENTS.md with codekit

codekit auto-generates AGENTS.md alongside other platform files:

```bash
# Generate for all platforms including AGENTS.md
codekit learn --all

# Generate only AGENTS.md
codekit learn -p agents

# Sync all platform files
codekit sync
```

The generated AGENTS.md includes:
- Project overview and type detection
- Build/test commands from package manager
- Full tech stack and dependency summary
- Code style conventions detected from the codebase
- Architecture patterns
- Installed skills reference
- Memory-bank session continuity instructions

## Best Practices

1. **Keep it concise** — Agents parse the entire file. Long files waste tokens.
2. **Focus on "what" not "how"** — Describe conventions and rules, not step-by-step tutorials.
3. **Include commands** — Build, test, lint, and deploy commands are the most universally useful.
4. **Update it** — AGENTS.md should evolve with the project. Run `codekit sync` after major changes.
5. **Don't duplicate** — If CLAUDE.md or .cursorrules already has platform-specific instructions, don't repeat them in AGENTS.md.

## Relationship to Other codekit Files

```
AGENTS.md          ← Universal baseline (all agents read this)
    ↕ complements
CLAUDE.md          ← Claude-specific (skills, memory-bank instructions)
.cursorrules       ← Cursor-specific (IDE behaviors)
GEMINI.md          ← Gemini-specific (CLI context)
memory-bank/       ← Session continuity (referenced by all files)
```

All these files are generated and synced by `codekit learn` and `codekit sync`. AGENTS.md acts as the common denominator that ensures any AI agent — current or future — can understand your project.
