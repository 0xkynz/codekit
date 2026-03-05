---
name: setup
description: Auto-detect project tech stack and install matching codekit skills. Use when setting up a new project, onboarding to an existing codebase, or when the user says "setup skills", "install skills for this project", "detect my stack", or "what skills do I need".
---

# Setup — Auto-Install Compatible Skills

Scan the current project, detect its tech stack, and install the matching codekit skills automatically.

## Workflow

1. **Detect** — Scan project files to identify technologies, language, and project type
2. **Match** — Map detected technologies to codekit skills
3. **Confirm** — Show the user what will be installed
4. **Install** — Run `codekit skills add <name>` for each match
5. **Update** — Run `codekit learn --all -y` to regenerate platform rules with installed skills

---

## Step 1: Detect Project Tech Stack

Scan the project root for these signals. Check them in order — stop early when the language ecosystem is clear.

### JavaScript / TypeScript Ecosystem

| Signal | What it tells you |
|--------|-------------------|
| **package.json** | Read `dependencies`, `devDependencies`, `scripts`, `bin`, `main`, `exports` |
| **tsconfig.json** | TypeScript project |
| **bun.lockb / bunfig.toml** | Bun runtime |
| **next.config.*** | Next.js fullstack |
| **nuxt.config.*** | Nuxt fullstack |
| **svelte.config.*** | SvelteKit fullstack |
| **vite.config.*** | Vite frontend |
| **app.json / app.config.js** with expo | Expo mobile |
| **Podfile / ios/** | iOS native |
| **android/** | Android native |

### Python Ecosystem

| Signal | What it tells you |
|--------|-------------------|
| **uv.lock / pyproject.toml** with `[tool.uv]` | Python + uv package manager |
| **pyproject.toml** | Python project (check `[project.dependencies]` or `[tool.poetry.dependencies]`) |
| **requirements.txt** | Python project (read for package names) |
| **Pipfile** | Python + pipenv |
| **setup.py / setup.cfg** | Python package |

### Other Languages

| Signal | What it tells you |
|--------|-------------------|
| **Cargo.toml** | Rust project |
| **go.mod** | Go project |
| **Gemfile / *.gemspec** | Ruby project |
| **composer.json** | PHP project |
| ***.csproj / *.sln** | .NET / C# project |
| **pom.xml / build.gradle** | Java / Kotlin project |
| **Package.swift** | Swift project |
| **mix.exs** | Elixir project |
| **Makefile + *.c/*.cpp/*.h** | C/C++ project |

### Cross-Language Signals

| Signal | What it tells you |
|--------|-------------------|
| **.github/workflows/** | GitHub Actions CI/CD |
| **.git/** | Git repository |
| **docker-compose.yml / Dockerfile** | Containerized project |
| **prisma/schema.prisma** | Prisma ORM (PostgreSQL/MySQL/MongoDB) |
| **drizzle.config.*** | Drizzle ORM |
| **mongod.conf / .mongodb** | MongoDB |

---

## Step 2: Detect Project Type

Determine the project type — this decides the Cook workflow phases:

| Signal | Project Type | Base Template | Phases |
|--------|-------------|---------------|--------|
| API routes, controllers, ORM, no UI — NestJS, ElysiaJS, FastAPI, Express, Hono | **Backend** | `cook-backend` | Plan → Code → Review → Test |
| React/Vue/Svelte SPA, CSS, components, no API routes | **Frontend** | `cook-frontend` | Plan → Design → Code → Review → Test |
| React Native, Expo, iOS/Android | **Mobile** | `cook-mobile` | Plan → Design → Code → Review → Test |
| Next.js, Nuxt, SvelteKit (API + UI in one project) | **Fullstack** | `cook-fullstack` | Plan → Design → Code API → Code UI → Review → Test |
| `bin` field, commander/yargs/meow/oclif, CLI entry | **CLI** | `cook-cli` | Plan → Code → Review → Test |
| `main`/`exports` in package.json, no app; or Python package with setup.py/pyproject.toml | **Library** | `cook-library` | Plan → Design → Code → Review → Test |

If mixed or unclear, use **Fullstack**.

---

## Step 3: Match Technologies to Skills

Use these lookup tables. Install a skill when **any** of its triggers match.

### Always Install

These skills benefit every project regardless of language:

| Skill | Reason |
|-------|--------|
| `memory-bank` | Persistent context across sessions |
| `git-expert` | Every project uses git |
| `agents` | Universal AI agent configuration (agents.md standard) |

### Python Detection

| Trigger | Skills to Install |
|---------|-------------------|
| `fastapi` in Python deps (requirements.txt, pyproject.toml, Pipfile) | `fastapi`, `python-fastapi` |
| `sqlalchemy`, `alembic` in Python deps | `database-expert` |
| `pymongo`, `motor`, `mongoengine` in Python deps | `database-expert` |
| `psycopg2`, `asyncpg` in Python deps | `database-expert` |
| `pgvector` in Python deps | `pgvector`, `database-expert` |
| `pytest`, `unittest` in Python deps | `testing-expert` |
| `ruff`, `flake8`, `pylint`, `black` in Python deps | `linting-expert` |

**Note:** Python with uv uses `pyproject.toml` (`[project.dependencies]`) or `uv.lock`. Read these files to detect packages.

### TypeScript / JavaScript Detection

| Trigger | Skills to Install |
|---------|-------------------|
| `typescript` in devDeps OR `tsconfig.json` exists | `typescript-expert` |
| `react` in deps (without `react-native`) | `react` |
| `next` in deps | `nextjs` |
| `react` OR `next` in deps | `uiux-design-expert`, `web-design-guidelines`, `vercel-react-best-practices`, `vercel-composition-patterns`, `chrome-devtools` |
| `@nestjs/core` in deps | `typescript-expert`, `database-expert`, `testing-expert` |
| `elysia` in deps AND `bun` runtime | `elysiajs-ddd` |
| `elysia` + `mongoose` in deps | `elysiajs-ddd-mongoose` (instead of `elysiajs-ddd`) |
| `elysia` + (`prisma` OR `drizzle` OR `pg`) in deps | `elysiajs-ddd` |
| `react-native` in deps (without `expo`) | `react-native`, `react-native-best-practices`, `vercel-react-native-skills`, `mobile-app-distribution` |
| `expo` in deps OR `app.json` with expo config | `react-native-expo`, `react-native-best-practices`, `vercel-react-native-skills`, `mobile-app-distribution` |

### React Recommended Stack

When `react` or `next` is detected, also check for these recommended frontend libraries. If they are **not** present in deps, suggest them as the recommended stack:

| Library | Purpose | Package Name |
|---------|---------|-------------|
| TanStack Query | Server state & data fetching | `@tanstack/react-query` |
| TanStack Table | Headless table/datagrid | `@tanstack/react-table` |
| Zod | Schema validation | `zod` |
| Zustand | Client state management | `zustand` |
| Axios | HTTP client | `axios` |
| React Hook Form | Form handling | `react-hook-form` |
| Recharts | Charts & data visualization | `recharts` |

**Behavior:**
- If the project already uses these libraries, no action needed — they're part of the stack.
- If the project is new or missing these, mention them as the recommended React stack when confirming with the user.
- `recharts` is optional — only recommend if the project has chart/dashboard features or the user asks for charts.

### Database Detection

| Trigger | Skills to Install |
|---------|-------------------|
| `pg`, `postgres`, `@neondatabase/serverless`, `knex`, `prisma`, `drizzle`, `sequelize`, `typeorm` in JS/TS deps | `database-expert` |
| `mongoose`, `mongodb`, `@typegoose/typegoose` in JS/TS deps | `database-expert` |
| `mysql2` in JS/TS deps | `database-expert` |
| `pgvector` in deps OR SQL files with `vector` type | `pgvector`, `database-expert` |
| `prisma/schema.prisma` exists | `database-expert` |

### Architecture Detection

| Trigger | Skills to Install |
|---------|-------------------|
| `@nestjs/core` OR `elysia` in deps with DDD-style folder structure (`domain/`, `application/`, `infrastructure/`) | `clean-architecture-ddd`, `domain-driven-hexagon` |
| `@nestjs/cqrs` in deps | `domain-driven-hexagon` |
| FastAPI with layered structure (`domain/`, `services/`, `repositories/`) | `clean-architecture-ddd` |

### Tooling Detection

| Trigger | Skills to Install |
|---------|-------------------|
| `jest`, `vitest`, `mocha`, or `@testing-library/*` in JS/TS deps | `testing-expert` |
| `eslint` or `prettier` in deps/devDeps | `linting-expert` |
| `.github/` directory exists | `github`, `github-actions` |
| `commander`, `yargs`, `meow`, or `oclif` in deps | `cli-expert` |

### Other Languages (Baseline Skills)

For languages without specialized skills, install the baseline:

| Language | Skills to Install |
|----------|-------------------|
| **Rust** (Cargo.toml) | `memory-bank`, `git-expert`, `testing-expert` + `cook` (auto-generated for backend or library) |
| **Go** (go.mod) | `memory-bank`, `git-expert`, `testing-expert` + `cook` (auto-generated for backend or library) |
| **Ruby** (Gemfile) | `memory-bank`, `git-expert`, `database-expert`, `testing-expert` + `cook` (auto-generated for backend) |
| **PHP** (composer.json) | `memory-bank`, `git-expert`, `database-expert`, `testing-expert` + `cook` (auto-generated for backend) |
| **.NET** (*.csproj) | `memory-bank`, `git-expert`, `database-expert`, `testing-expert` + `cook` (auto-generated for backend or fullstack) |
| **Java/Kotlin** (pom.xml/build.gradle) | `memory-bank`, `git-expert`, `database-expert`, `testing-expert` + `cook` (auto-generated for backend) |
| **Swift** (Package.swift) | `memory-bank`, `git-expert` + `cook` (auto-generated for mobile or library) |
| **Elixir** (mix.exs) | `memory-bank`, `git-expert`, `database-expert`, `testing-expert` + `cook` (auto-generated for backend) |
| **C/C++** (Makefile + *.c/*.h) | `memory-bank`, `git-expert`, `testing-expert` + `cook` (auto-generated for library) |

For these languages, add `github` + `github-actions` if `.github/` exists, and `linting-expert` if linter config files exist.

---

## Step 4: Skip Rules

Do NOT install skills that conflict:
- `react` and `nextjs` are alternatives — install `nextjs` if both `react` and `next` are in deps
- `react-native` and `react-native-expo` are alternatives — install based on whether `expo` is present
- `elysiajs-ddd` and `elysiajs-ddd-mongoose` are alternatives — install based on whether `mongoose` is present
- `python-fastapi` and `fastapi` — install both (they complement each other with different depth)
- Do NOT install pre-built cook variants — always auto-generate `cook` (see Step 7)

---

## Step 5: Confirm with User

Before installing, show the detection results and proposed skills:

```
Detected: TypeScript, Bun, ElysiaJS, Mongoose, GitHub Actions
Project type: Backend

Skills to install (11):
  Always:    memory-bank, agents, git-expert
  Auto-gen:  cook (customized for backend — ElysiaJS + Mongoose)
  Framework: elysiajs-ddd-mongoose, typescript-expert
  Database:  database-expert
  Arch:      clean-architecture-ddd, domain-driven-hexagon
  Tooling:   testing-expert, github, github-actions

Proceed? (Y/n)
```

If the user declines, ask which skills to skip.

---

## Step 6: Install Skills

Run each install command:

```bash
codekit skills add <name>
```

Install sequentially to avoid conflicts. If a skill is already installed, skip it — `codekit skills add` will report it.

After installing, check for related skills the user might also want:

```bash
codekit skills related <name>
```

---

## Step 7: Generate Cook Skill

**Do NOT install a pre-built cook variant.** Instead, generate a custom `cook` skill tailored to this project.

### How to Generate

1. Read the matching base cook template: `codekit skills add <cook-variant>` to get the base, OR read it from `.claude/skills/cook-<type>/SKILL.md`
2. **Generate** `.claude/skills/cook/SKILL.md` by customizing the base template with project-specific details
3. Remove the base variant after generating (only keep the customized `cook`)

### What to Customize

Replace generic terms with actual project details:

| Generic | Replace With |
|---------|-------------|
| "API routes, controllers" | Actual framework (e.g., "NestJS controllers", "FastAPI routers", "ElysiaJS handlers") |
| "models, migrations, schemas" | Actual ORM (e.g., "Prisma models", "Mongoose schemas", "SQLAlchemy models + Alembic migrations") |
| "Run the full test suite" | Actual command (e.g., "`bun run test`", "`pytest`", "`vitest run`") |
| "Run type checking" | Actual command (e.g., "`tsc --noEmit`", "`mypy .`") |
| "Run linting" | Actual command (e.g., "`eslint .`", "`ruff check .`") |
| "components, pages, state" | Actual stack (e.g., "React components with Zustand store", "Next.js pages with TanStack Query") |
| "data fetching" | Actual library (e.g., "TanStack Query", "SWR", "Axios") |
| "form handling" | Actual library (e.g., "React Hook Form + Zod validation") |
| "package manager" | Actual PM (e.g., "`bun`", "`uv`", "`pnpm`") |

### Generated Cook Structure

The generated `.claude/skills/cook/SKILL.md` must always include:

```markdown
---
name: cook
description: [Project-specific description with actual tech stack]
---

# Cook — [Project Type] Workflow for [Project Name]

[Phase diagram]

---

## Memory Bank — Required for Every Session
[Always include this section — copy from any cook variant]

---

## [PLAN] Plan
[Customized with actual project context]

## [DESIGN] Design (if applicable)
[Customized with actual component/API patterns]

## [CODE] Code
[Customized with actual framework, ORM, patterns]

## [REVIEW] Review
[Customized checklist with actual tech-specific checks]

## [TEST] Test
[Customized with actual test runner, commands, patterns]

---

## Iteration
[Standard iteration rules]

## Phase Markers
[Standard phase markers]
```

### Example: Generated Cook for a Next.js + Prisma + TanStack Project

```markdown
---
name: cook
description: Workflow orchestration for the [project-name] fullstack project — Next.js 15, Prisma, TanStack Query, Zustand. Phases: Plan, Design, Code API, Code UI, Review, Test.
---

# Cook — Fullstack Workflow for [project-name]

Plan → Design → Code (API first) → Code (UI) → Review → Test

## Memory Bank — Required for Every Session
[... standard memory-bank section ...]

## [PLAN] Plan
1. Read requirements. Identify both API routes and page/component changes.
2. Break into backend subtasks (Prisma models, API routes) and frontend subtasks (components, pages).
3. Define the API contract — Next.js API route request/response shapes.
4. Define acceptance criteria for the full user flow.

## [DESIGN] Design
1. Design API contract first — Next.js API routes are the bridge.
2. Define component hierarchy and TanStack Query data fetching strategy.
3. Plan Zustand store shape for client state.
4. Plan loading states, optimistic UI, and error handling.

## [CODE] Code — API First
1. Implement Prisma schema changes and run `bunx prisma db push`.
2. Implement Next.js API routes / Server Actions.
3. Validate API works with a test or manual check.
4. Then implement React components with TanStack Query for data fetching.
5. Wire up React Hook Form + Zod for form validation.
6. Use Zustand for client-side state where needed.

## [REVIEW] Review
1. **Prisma** — Schema correct? Migrations clean? No N+1 queries?
2. **API routes** — Correct HTTP methods? Input validated with Zod? Proper error responses?
3. **Components** — TanStack Query keys correct? Loading/error states handled?
4. **Forms** — React Hook Form + Zod validation working? Error messages shown?
5. **Types** — No `any`? Prisma types flowing through to components?
6. **Security** — Auth checks on protected routes? No exposed secrets?

## [TEST] Test
1. `bun run test` — Run Vitest suite.
2. `tsc --noEmit` — Type check passes.
3. `eslint .` — No lint errors.
4. Test API routes with edge case inputs.
5. Visual check — run `bun run dev` and verify the feature.
```

---

## Step 8: Update Platform Rules

After all skills are installed and cook is generated, regenerate platform rules:

```bash
codekit learn --all -y
```

This updates CLAUDE.md, .cursorrules, GEMINI.md, and AGENTS.md with the installed skills section.

---

## Example Detection

### Python FastAPI + uv Project (Backend)

```toml
# pyproject.toml
[project]
dependencies = [
    "fastapi>=0.115.0",
    "sqlalchemy[asyncio]>=2.0",
    "asyncpg>=0.30.0",
    "alembic>=1.14.0",
]

[tool.uv]
dev-dependencies = [
    "pytest>=8.0",
    "ruff>=0.8.0",
]
```

Detected: Python, uv, FastAPI, SQLAlchemy, asyncpg (PostgreSQL), pytest, ruff
Project type: **Backend** (FastAPI API, no UI)

Installed skills:
- `memory-bank`, `agents`, `git-expert` (always) + `cook` (auto-generated for backend)
- `fastapi`, `python-fastapi` (fastapi in deps)
- `database-expert` (sqlalchemy + asyncpg in deps)
- `testing-expert` (pytest in dev-deps)
- `linting-expert` (ruff in dev-deps)
- `github`, `github-actions` (if .github/ exists)

### NestJS + PostgreSQL Project (Backend)

```json
{
  "dependencies": {
    "@nestjs/core": "^10.0.0",
    "@nestjs/typeorm": "^10.0.0",
    "typeorm": "^0.3.0",
    "pg": "^8.0.0"
  },
  "devDependencies": {
    "typescript": "5.x",
    "jest": "29.x",
    "eslint": "9.x"
  }
}
```

Detected: TypeScript, NestJS, TypeORM, PostgreSQL, Jest, ESLint
Project type: **Backend** (NestJS, no UI)

Installed skills:
- `memory-bank`, `agents`, `git-expert` (always) + `cook` (auto-generated for backend)
- `typescript-expert` (typescript in devDeps)
- `database-expert` (typeorm + pg in deps)
- `clean-architecture-ddd`, `domain-driven-hexagon` (NestJS architecture)
- `testing-expert` (jest in devDeps)
- `linting-expert` (eslint in devDeps)
- `github`, `github-actions` (if .github/ exists)

### Bun ElysiaJS + MongoDB Project (Backend)

```json
{
  "dependencies": {
    "elysia": "^1.2.0",
    "mongoose": "^8.0.0",
    "@elysiajs/cors": "^1.0.0"
  },
  "devDependencies": {
    "typescript": "5.x",
    "bun-types": "latest"
  }
}
```

Detected: TypeScript, Bun, ElysiaJS, Mongoose (MongoDB)
Project type: **Backend** (ElysiaJS API, no UI)

Installed skills:
- `memory-bank`, `agents`, `git-expert` (always) + `cook` (auto-generated for backend)
- `elysiajs-ddd-mongoose` (elysia + mongoose in deps)
- `typescript-expert` (typescript in devDeps)
- `database-expert` (mongoose in deps)
- `clean-architecture-ddd`, `domain-driven-hexagon` (DDD architecture)
- `testing-expert`

### Bun ElysiaJS + PostgreSQL Project (Backend)

```json
{
  "dependencies": {
    "elysia": "^1.2.0",
    "prisma": "^6.0.0",
    "@prisma/client": "^6.0.0"
  },
  "devDependencies": {
    "typescript": "5.x",
    "bun-types": "latest"
  }
}
```

Detected: TypeScript, Bun, ElysiaJS, Prisma (PostgreSQL)
Project type: **Backend** (ElysiaJS API, no UI)

Installed skills:
- `memory-bank`, `agents`, `git-expert` (always) + `cook` (auto-generated for backend)
- `elysiajs-ddd` (elysia + prisma in deps, no mongoose)
- `typescript-expert` (typescript in devDeps)
- `database-expert` (prisma in deps)
- `clean-architecture-ddd`, `domain-driven-hexagon` (DDD architecture)
- `testing-expert`

### Next.js + Prisma Project (Fullstack)

```json
{
  "dependencies": {
    "next": "15.x",
    "react": "19.x",
    "@prisma/client": "6.x",
    "@tanstack/react-query": "^5.0.0",
    "@tanstack/react-table": "^8.0.0",
    "zustand": "^5.0.0",
    "axios": "^1.7.0",
    "react-hook-form": "^7.0.0",
    "zod": "^3.23.0"
  },
  "devDependencies": {
    "typescript": "5.x",
    "eslint": "9.x",
    "vitest": "3.x"
  }
}
```

Detected: TypeScript, Next.js, React, Prisma, TanStack Query, TanStack Table, Zustand, Axios, React Hook Form, Zod, ESLint, Vitest
Project type: **Fullstack** (Next.js = API + UI)

Installed skills:
- `memory-bank`, `agents`, `git-expert` (always) + `cook` (auto-generated for fullstack)
- `nextjs` (next in deps, prefer over react since both present)
- `typescript-expert` (typescript in devDeps)
- `uiux-design-expert`, `web-design-guidelines`, `vercel-react-best-practices`, `vercel-composition-patterns`, `chrome-devtools` (frontend stack)
- `database-expert` (prisma in deps)
- `testing-expert` (vitest in devDeps)
- `linting-expert` (eslint in devDeps)
- `github`, `github-actions` (if .github/ exists)

Recommended stack detected: TanStack Query, TanStack Table, Zustand, Axios, React Hook Form, Zod

### React SPA Project (Frontend)

```json
{
  "dependencies": {
    "react": "19.x",
    "react-dom": "19.x",
    "@tanstack/react-query": "^5.0.0",
    "@tanstack/react-table": "^8.0.0",
    "zustand": "^5.0.0",
    "axios": "^1.7.0",
    "react-hook-form": "^7.0.0",
    "zod": "^3.23.0",
    "recharts": "^2.0.0"
  },
  "devDependencies": {
    "typescript": "5.x",
    "vite": "6.x",
    "eslint": "9.x",
    "vitest": "3.x"
  }
}
```

Detected: TypeScript, React, Vite, TanStack Query, TanStack Table, Zustand, Axios, React Hook Form, Zod, Recharts, ESLint, Vitest
Project type: **Frontend** (React SPA, no API layer)

Installed skills:
- `memory-bank`, `agents`, `git-expert` (always) + `cook` (auto-generated for frontend)
- `react` (react in deps, no next)
- `typescript-expert` (typescript in devDeps)
- `uiux-design-expert`, `web-design-guidelines`, `vercel-react-best-practices`, `vercel-composition-patterns`, `chrome-devtools` (frontend stack)
- `testing-expert` (vitest in devDeps)
- `linting-expert` (eslint in devDeps)

Recommended stack detected: TanStack Query, TanStack Table, Zustand, Axios, React Hook Form, Zod, Recharts

### React Native Expo Project (Mobile)

```json
{
  "dependencies": {
    "expo": "52.x",
    "react-native": "0.76.x",
    "expo-router": "4.x"
  },
  "devDependencies": {
    "typescript": "5.x",
    "jest": "29.x"
  }
}
```

Detected: TypeScript, Expo, React Native, Jest
Project type: **Mobile** (React Native + Expo)

Installed skills:
- `memory-bank`, `agents`, `git-expert` (always) + `cook` (auto-generated for mobile)
- `react-native-expo` (expo in deps)
- `react-native-best-practices`, `vercel-react-native-skills` (mobile enhancers)
- `mobile-app-distribution` (mobile project)
- `typescript-expert` (typescript in devDeps)
- `testing-expert` (jest in devDeps)

### CLI Tool Project (CLI)

```json
{
  "bin": { "mytool": "./dist/index.js" },
  "dependencies": {
    "commander": "^12.0.0"
  },
  "devDependencies": {
    "typescript": "5.x",
    "vitest": "3.x"
  }
}
```

Detected: TypeScript, Commander, Vitest
Project type: **CLI** (`bin` field + commander)

Installed skills:
- `memory-bank`, `agents`, `git-expert` (always) + `cook` (auto-generated for CLI)
- `cli-expert` (commander in deps)
- `typescript-expert` (typescript in devDeps)
- `testing-expert` (vitest in devDeps)

### Go Backend Project (Backend)

```go
// go.mod
module github.com/user/api
go 1.23

require (
    github.com/gin-gonic/gin v1.10.0
    github.com/jackc/pgx/v5 v5.7.0
)
```

Detected: Go, Gin, pgx (PostgreSQL)
Project type: **Backend** (API with database)

Installed skills:
- `memory-bank`, `agents`, `git-expert` (always) + `cook` (auto-generated for backend)
- `database-expert` (pgx = PostgreSQL)
- `testing-expert` (Go has built-in testing)
- `github`, `github-actions` (if .github/ exists)

### Rust Library Project (Library)

```toml
# Cargo.toml
[package]
name = "my-lib"
version = "0.1.0"

[lib]
name = "my_lib"

[dev-dependencies]
tokio-test = "0.4"
```

Detected: Rust, library crate
Project type: **Library** (`[lib]` section in Cargo.toml)

Installed skills:
- `memory-bank`, `agents`, `git-expert` (always) + `cook` (auto-generated for library)
- `testing-expert`
- `github`, `github-actions` (if .github/ exists)
