# codekit

![codekit banner](docs/assets/codekit_banner.png)

> **AI Configuration Manager** - Bridge the gap between domain expertise and AI agents.

## Overview

codekit is a CLI tool designed to help you strictly manage AI assistant configurations across **Claude Code**, **Cursor**, and **Gemini CLI**. It solves the problem of "drift" where AI rules, context, and instructions become scattered or outdated.

With codekit, you define your **Skills** (capabilities) and **Commands** (workflows) once, and synchronization ensures every AI tool you use respects the same boundaries and knowledge.

### Why codekit?

- **Unified Intelligence**: Write rules once, deploy to logic for Claude, Cursor, and Gemini.
- **Project Memory/Context**: Automatically maintain a `memory-bank/` that persists project context across sessions.
- **Progressive Skills**: Install powerful capabilities (like PDF processing or Data Viz) that load only when needed, saving context window.
- **Instant Onboarding**: `codekit learn` scans your project and generates a perfect starting configuration in seconds.

## Supported AI Assistants

| Platform | Config File | Description |
|----------|-------------|-------------|
| **Claude Code** | `CLAUDE.md` | Anthropic Claude Code CLI |
| **Cursor** | `.cursorrules` | Cursor AI IDE |
| **Gemini CLI** | `GEMINI.md` | Google Gemini CLI (Antigravity) |

## Installation

### From Source (Development)

```bash
# Clone and install dependencies
cd codekit
bun install

# Run in development mode
bun run dev -- <command>

# Or link globally for development
bun link
```

### Compiled Binary

```bash
# Build the binary
bun run build

# The binary will be at dist/codekit-<platform>-<arch>
./dist/codekit-darwin-arm64 --version
```

**Supported platforms:**
- macOS (darwin-arm64, darwin-x64)
- Linux (linux-arm64, linux-x64)
- Windows (windows-x64)

## Quick Start

```bash
# Scan project and generate rules for all AI assistants
codekit learn --all

# Or generate for specific platforms
codekit learn -p claude,cursor

# Interactive mode - choose platforms
codekit learn

# Sync rules across all platforms (regenerate from current project state)
codekit sync

# Initialize a new Claude project
codekit init

# List all available skills
codekit skills list

# Install a skill
codekit skills add typescript-expert

# Install to global ~/.claude directory
codekit skills add react --global
```

## Core Concepts



### ⚡️ Skills (Capabilities)
Skills are modular capabilities that provide domain expertise and extend functionality beyond simple prompts. They use **Progressive Disclosure** to keep your context window efficient:

```
┌──────────────────────┐      ┌────────────────────────┐      ┌──────────────────────┐
│  Level 1: Metadata   │  ->  │  Level 2: Instructions │  ->  │  Level 3: Resources  │
│   (Always Loaded)    │      │    (Loaded on Use)     │      │     (As Needed)      │
└──────────────────────┘      └────────────────────────┘      └──────────────────────┘
   ~100 tokens/skill                ~2k tokens                     Unlimited
```

**Why this matters:** You can have 50+ skills installed (PDF reading, Database access, Graphing), but Claude only "pays" the token cost for the ones it actually uses in the current session.

### 🛠️ Commands (Workflows)
Commands are user-defined operations that expand into complex prompts. Typing `/commit` isn't just a text shortcut—it triggers a multi-step guided workflow that ensures your commit messages follow team standards, every time.

## Commands

### `codekit init`

Initialize a new Claude project with the `.claude/` directory structure.

```bash
codekit init              # Interactive setup
codekit init --yes        # Accept all defaults
codekit init --global     # Initialize ~/.claude instead
codekit init --dry-run    # Preview without writing
```

**Options:**
- `-g, --global` - Initialize in global `~/.claude` directory
- `-y, --yes` - Accept all defaults without prompting
- `-f, --force` - Overwrite existing configuration
- `--dry-run` - Show what would be created without writing

### `codekit learn`

Scan an existing project and create AI assistant rules for multiple platforms. This command:
- Detects tech stack (languages, frameworks, build tools, testing)
- **Scans all package dependencies** from language-specific package files
- Analyzes project structure and patterns
- **Generates rules for Claude, Cursor, and Gemini** from a single scan
- Creates `memory-bank/` with structured context files

```bash
codekit learn              # Interactive - choose platforms
codekit learn --all        # Generate rules for all platforms
codekit learn -p claude,cursor  # Specific platforms
codekit learn --yes        # Accept defaults (Claude + memory-bank)
codekit learn --claude-md  # Legacy: only CLAUDE.md
codekit learn --memory-bank # Only create memory-bank
codekit learn --dry-run    # Preview what would be created
```

**Options:**
- `-a, --all` - Generate rules for all supported platforms
- `-p, --platforms <list>` - Comma-separated platforms: claude,cursor,gemini
- `-f, --force` - Overwrite existing files
- `-y, --yes` - Accept all defaults without prompting
- `--dry-run` - Show what would be created without writing
- `--claude-md` - Only create/update CLAUDE.md (legacy)
- `--memory-bank` - Only create/update memory-bank

**Supported package formats:**

| Language | Package Files |
|----------|---------------|
| JavaScript/TypeScript | `package.json` |
| Python | `pyproject.toml`, `requirements.txt`, `Pipfile`, `setup.py` |
| Rust | `Cargo.toml` |
| Go | `go.mod` |
| Ruby | `Gemfile` |
| Java | `pom.xml`, `build.gradle`, `build.gradle.kts` |
| PHP | `composer.json` |
| .NET | `*.csproj` |
| Swift | `Package.swift` |
| Elixir | `mix.exs` |

**What it creates:**

```
project/
├── CLAUDE.md              # Rules for Claude Code
├── .cursorrules           # Rules for Cursor IDE
├── GEMINI.md              # Rules for Gemini CLI
└── memory-bank/           # Persistent context (shared)
    ├── projectbrief.md    # Core requirements and goals
    ├── productContext.md  # Problem and solution context
    ├── techContext.md     # Tech stack, setup, and dependencies
    ├── systemPatterns.md  # Architecture patterns
    ├── activeContext.md   # Current work focus
    └── progress.md        # Status and progress
```

### `codekit sync`

Synchronize AI assistant rules across all platforms by regenerating them from the current project state.

```bash
codekit sync               # Interactive - choose platforms to sync
codekit sync -p claude,cursor  # Sync specific platforms
codekit sync --force       # Overwrite without prompting
codekit sync --dry-run     # Preview what would be synced
```

**Options:**
- `-p, --platforms <list>` - Comma-separated platforms to sync
- `-f, --force` - Overwrite all existing files without prompting
- `-y, --yes` - Accept all defaults without prompting
- `--dry-run` - Show what would be updated without writing

**Use cases:**
- Project dependencies have changed
- You want to update all AI assistant configs at once
- New platform files need to be generated

### `codekit skills`

Manage skill definitions. Skills are directory-based resources with domain expertise, instructions, and optional scripts.

#### List Skills

```bash
codekit skills list           # Show bundled and installed skills
codekit skills list --global  # Show global skills only
codekit skills ls             # Alias for list
```

**Output shows:**
- Bundled skills organized by category
- Installed status (checkmark indicates installed)
- Global skills from `~/.claude/skills/`
- Project skills from `./.claude/skills/`

#### Add Skill

```bash
codekit skills add <name>           # Install from bundled templates
codekit skills add typescript-expert
codekit skills add react --global
codekit skills add cli-expert --force      # Overwrite existing
codekit skills add database-expert --dry-run
```

**Options:**
- `-g, --global` - Install to `~/.claude/skills/`
- `-f, --force` - Overwrite if already installed
- `--skip-deps` - Skip installing dependencies
- `--dry-run` - Preview without writing

#### Remove Skill

```bash
codekit skills remove <name>         # Remove installed skill
codekit skills rm typescript-expert  # Alias
codekit skills remove react --global
```

**Options:**
- `-g, --global` - Remove from `~/.claude/skills/`
- `-f, --force` - Skip confirmation prompt

### `codekit commands`

Manage slash command definitions. Commands are user-defined operations that expand to prompts.

```bash
codekit commands list
codekit commands add git/commit
codekit commands remove code-review --global
```

Same options as skills commands.

## Bundled Templates

### Skills

| Category | Skill | Description |
|----------|-------|-------------|
| **backend** | fastapi | Python FastAPI, SQLAlchemy 2.0, Pydantic v2, uv, async APIs |
| **backend** | python-fastapi | Python FastAPI project patterns and structure |
| **backend** | elysiajs-ddd | ElysiaJS with DDD, Prisma, Better Auth, Bun runtime |
| **backend** | elysiajs-ddd-mongoose | ElysiaJS with DDD, MongoDB, Mongoose, Better Auth |
| **code-quality** | linting-expert | ESLint, Prettier, static analysis, CI/CD quality gates |
| **data** | data-visualization | Create charts and visualizations |
| **database** | database-expert | Database optimization across PostgreSQL, MySQL, MongoDB |
| **devops** | cli-expert | npm CLI development, Unix philosophy, argument parsing |
| **document** | pdf-processing | Extract and analyze PDF content |
| **frontend** | react | React + Vite, TanStack, shadcn/ui, state management |
| **frontend** | nextjs | Next.js 15, App Router, Server Components, Server Actions |
| **frontend** | uiux-design-expert | Design systems, glassmorphism, accessibility |
| **git** | git-expert | Merge conflicts, branching, history management |
| **mobile** | react-native | React Native with native modules |
| **mobile** | react-native-expo | React Native with Expo workflow |
| **testing** | testing-expert | Jest/Vitest, mocking patterns, test architecture |
| **typescript** | typescript-expert | Type system, generics, compiler configuration |
| **workflow** | memory-bank | Persistent project context across sessions |

### Commands

| Category | Command | Description |
|----------|---------|-------------|
| **git** | commit | Create commits following project style |
| **git** | status | Analyze git status with insights |
| **code** | code-review | Multi-aspect code review |
| **code** | validate-and-fix | Run quality checks and auto-fix |

## Directory Structure

codekit manages the following directory structure:

```
.claude/                    # Project-level (or ~/.claude/ for global)
├── skills/                 # Skill directories
│   ├── typescript-expert/
│   │   └── SKILL.md        # Required: skill instructions
│   └── pdf-processing/
│       ├── SKILL.md        # Required: skill instructions
│       └── scripts/        # Optional: helper scripts
└── commands/               # Slash commands
    └── git/
        └── commit.md
```

## Resource Format

### Skill Format

Skills are directories with a required `SKILL.md`:

```markdown
---
name: my-skill
description: What the skill does and when to use it
---

# My Skill

## Instructions
[Step-by-step guidance for Claude]

## Examples
[Concrete examples of using this skill]
```

**Skill naming requirements:**
- Maximum 64 characters
- Lowercase letters, numbers, and hyphens only
- Cannot contain reserved words: "anthropic", "claude"
- Description maximum 1024 characters

See [SKILLS.md](SKILLS.md) for comprehensive skill documentation.

### Command Format

Commands use similar YAML frontmatter:

```markdown
---
description: What the command does
allowed-tools: Bash, Read, Edit
argument-hint: "[optional args]"
---

Command prompt instructions...
```

## Global vs Project Scope

| Scope | Location | Flag | Use Case |
|-------|----------|------|----------|
| **Project** | `./.claude/` | (default) | Project-specific configuration |
| **Global** | `~/.claude/` | `--global` | Shared across all projects |

Project-level resources take precedence over global resources with the same name.

## Examples

### Learning an Existing Project

```bash
# Scan project and create context files
codekit learn

# This creates:
# - CLAUDE.md with project rules
# - memory-bank/ with 6 context files

# Review and customize the generated files
# Then Claude Code will understand your project!
```

### Setting Up a TypeScript Project

```bash
# Initialize project
codekit init

# Add relevant skills
codekit skills add typescript-expert
codekit skills add linting-expert
codekit skills add testing-expert

# Add useful commands
codekit commands add git/commit
codekit commands add validate-and-fix
```

### Setting Up Global Defaults

```bash
# Initialize global config
codekit init --global

# Add commonly used skills globally
codekit skills add git-expert --global
codekit skills add cli-expert --global
```

### Checking What's Installed

```bash
# See all skills with installation status
codekit skills list

# Output example:
# Bundled Skills
#   typescript
#     ✓ typescript-expert - TypeScript Expert
#
# Global Skills (~/.claude/skills/)
#   ✓ git-expert - Git Expert
#
# Project Skills (./.claude/skills/)
#   ✓ typescript-expert - TypeScript Expert
```

### Preview Before Installing

```bash
# See what would be installed
codekit skills add react --dry-run

# Output shows file paths and content that would be written
```

## Development

### Running Locally

```bash
bun install
bun run dev -- skills list
```

### Building

```bash
# Generate embedded templates (VFS)
bun run build:vfs

# Build binary
bun run build
```

### Adding New Templates

1. Create a skill directory in `templates/skills/<name>/SKILL.md` or a command file in `templates/commands/<category>/<name>.md`
2. Add entry to the appropriate `templates/<type>/index.json` manifest
3. Rebuild VFS: `bun run build:vfs`

### Architecture

```
src/
├── index.ts              # Entry point
├── cli.ts                # CLI setup with commander.js
├── commands/             # Command handlers
│   ├── skills/           # Skill management (list, add, remove)
│   ├── commands/         # Command management (list, add, remove)
│   ├── init.ts           # Project initialization
│   └── learn.ts          # Project scanning/learning
├── core/                 # Core managers
│   ├── resource-manager.ts   # Abstract base for managing resources
│   ├── skill-manager.ts      # Skill-specific manager
│   ├── command-manager.ts    # Command-specific manager
│   └── template-loader.ts    # Loads bundled templates from VFS
├── types/                # TypeScript interfaces
└── utils/                # Utilities
    ├── paths.ts          # Path resolution (.claude vs ~/.claude)
    ├── logger.ts         # Console output with styling
    ├── yaml-parser.ts    # YAML frontmatter parsing
    └── project-scanner.ts # Project analysis for `codekit learn`
```

## License

MIT
