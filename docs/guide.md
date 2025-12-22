# ClaudeKit User Guide

A comprehensive guide to using codekit for managing Claude Code resources.

## Table of Contents

1. [Understanding Claude Code Resources](#understanding-claude-code-resources)
2. [Getting Started](#getting-started)
3. [Working with Agents](#working-with-agents)
4. [Working with Skills](#working-with-skills)
5. [Working with Commands](#working-with-commands)
6. [Scope: Project vs Global](#scope-project-vs-global)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

---

## Understanding Claude Code Resources

Claude Code uses three types of resources to extend its capabilities:

### Agents

Agents are specialized AI personas with domain expertise. When Claude Code encounters a problem matching an agent's domain, it can invoke that agent for focused assistance.

**Example**: A `typescript-expert` agent provides deep knowledge of TypeScript's type system, generics, and compiler configuration.

**Key characteristics:**
- Single markdown file with YAML frontmatter
- Contains specialized instructions and knowledge
- Triggered proactively based on description keywords
- Can specify required tools (Read, Edit, Bash, etc.)

### Skills

Skills are directory-based resources that provide structured capabilities with optional helper scripts.

**Example**: A `pdf-processing` skill includes instructions for handling PDFs and potentially Python scripts for extraction.

**Key characteristics:**
- Directory structure with required `SKILL.md`
- Can include helper scripts in `scripts/` subdirectory
- Progressive disclosure - only activated when needed
- Supports complex, multi-file functionality

### Commands

Commands (slash commands) are user-defined operations that expand to prompts when invoked with `/command-name`.

**Example**: `/commit` expands to a prompt that guides Claude to create a well-formatted git commit.

**Key characteristics:**
- Single markdown file with instructions
- Invoked explicitly by user with `/` prefix
- Can specify allowed tools
- Can accept arguments

---

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) runtime installed
- Claude Code CLI installed and configured

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd codekit

# Install dependencies
bun install

# Run codekit
bun run dev -- --help
```

### First Steps

1. **Initialize your project**

   Navigate to your project directory and run:

   ```bash
   codekit init
   ```

   This creates the `.claude/` directory structure:

   ```
   .claude/
   ├── agents/
   ├── skills/
   └── commands/
   ```

2. **Browse available agents**

   ```bash
   codekit agents list
   ```

   You'll see bundled agents organized by category, plus any globally or locally installed agents.

3. **Install your first agent**

   ```bash
   codekit agents add typescript-expert
   ```

   This copies the agent template to `.claude/agents/typescript-expert.md`.

---

## Working with Agents

### Listing Agents

```bash
# Show all agents (bundled + installed)
codekit agents list

# Show only global agents
codekit agents list --global
```

**Output explanation:**

```
📦 Bundled Agents        <- Templates available to install

  typescript
    ✓ typescript-expert  <- ✓ means installed in project
      typescript-build   <- No checkmark = not installed

🌐 Global Agents         <- Installed in ~/.claude/agents/
  ✓ git-expert

📁 Project Agents        <- Installed in ./.claude/agents/
  ✓ typescript-expert
```

### Installing Agents

**Basic installation:**

```bash
codekit agents add <agent-name>
```

**With options:**

```bash
# Install globally (shared across all projects)
codekit agents add react-expert --global

# Force overwrite existing
codekit agents add typescript-expert --force

# Preview without installing
codekit agents add database-expert --dry-run

# Skip dependency installation
codekit agents add cli-expert --skip-deps
```

### Agent Dependencies

Some agents depend on others. For example, `cli-expert` depends on `nodejs-expert`.

When you install an agent with dependencies:

```bash
codekit agents add cli-expert
```

You'll be prompted to install dependencies as well. Use `--skip-deps` to skip this.

### Removing Agents

```bash
# Remove from project
codekit agents remove typescript-expert

# Remove from global
codekit agents remove git-expert --global

# Skip confirmation
codekit agents remove react-expert --force
```

### Understanding Agent Structure

Each agent file follows this format:

```markdown
---
name: typescript-expert
description: TypeScript expert for type system, generics...
category: typescript
displayName: TypeScript Expert
color: blue
tools: Read, Edit, Grep, Glob, Bash
---

# TypeScript Expert

You are an expert in TypeScript...

## When to Use

Use this agent when...

## Capabilities

- Type inference and narrowing
- Generic type parameters
- ...
```

**Frontmatter fields:**

| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | Unique identifier (kebab-case) |
| `description` | Yes | What triggers this agent. Include "Use PROACTIVELY" for auto-invocation |
| `category` | No | Grouping for organization |
| `displayName` | No | Human-readable name |
| `color` | No | Terminal color hint |
| `tools` | No | Allowed tools (Read, Edit, Bash, etc.) |
| `bundle` | No | Array of dependent agent names |

---

## Working with Skills

### Listing Skills

```bash
codekit skills list
```

### Installing Skills

```bash
codekit skills add pdf-processing
codekit skills add data-visualization --global
```

### Skill Directory Structure

Skills are directories, not single files:

```
.claude/skills/pdf-processing/
├── SKILL.md              # Required: main instructions
├── FORMS.md              # Optional: additional forms/templates
└── scripts/              # Optional: helper scripts
    ├── extract.py
    └── analyze.py
```

### Creating Custom Skills

1. Create the directory:
   ```bash
   mkdir -p .claude/skills/my-skill/scripts
   ```

2. Create `SKILL.md`:
   ```markdown
   ---
   name: my-skill
   description: What this skill does
   ---

   # My Custom Skill

   Instructions for using this skill...
   ```

3. Add helper scripts if needed in `scripts/`

---

## Working with Commands

### Listing Commands

```bash
codekit commands list
```

### Installing Commands

```bash
codekit commands add git/commit
codekit commands add code-review --global
```

### Using Installed Commands

Once installed, invoke commands in Claude Code with:

```
/commit
/code-review src/
```

### Command Structure

```markdown
---
description: Create a git commit following project conventions
allowed-tools: Bash, Read, Edit
argument-hint: "[files to commit]"
---

Create a well-formatted git commit message...
```

**Frontmatter fields:**

| Field | Required | Description |
|-------|----------|-------------|
| `description` | Yes | Shown in `/help` and command list |
| `allowed-tools` | No | Restrict which tools the command can use |
| `argument-hint` | No | Help text for arguments |

---

## Scope: Project vs Global

### Project Scope (Default)

- Location: `./.claude/`
- Use for: Project-specific configurations
- Committed to git: Your choice (typically yes for team sharing)

```bash
codekit agents add typescript-expert  # Installs to ./.claude/agents/
```

### Global Scope

- Location: `~/.claude/`
- Use for: Personal preferences, shared across all projects
- Not committed to git

```bash
codekit agents add typescript-expert --global  # Installs to ~/.claude/agents/
```

### Precedence

When both exist, **project scope takes precedence** over global scope.

Example: If you have both:
- `~/.claude/agents/typescript-expert.md` (global)
- `./.claude/agents/typescript-expert.md` (project)

Claude Code will use the project version.

### Recommendations

| Resource | Recommended Scope |
|----------|-------------------|
| Generic utilities (git-expert) | Global |
| Project framework agents (react-expert) | Project |
| Personal workflow commands | Global |
| Team standards commands | Project |

---

## Best Practices

### 1. Start with Global Basics

Set up commonly used agents globally:

```bash
codekit init --global
codekit agents add git-expert --global
codekit agents add linting-expert --global
```

### 2. Add Project-Specific Agents

Install framework and language agents at project level:

```bash
codekit init
codekit agents add react-expert
codekit agents add typescript-expert
```

### 3. Use Dry Run Before Installing

Preview what will be created:

```bash
codekit agents add database-expert --dry-run
```

### 4. Commit Project Resources

Add `.claude/` to version control for team sharing:

```bash
git add .claude/
git commit -m "Add Claude Code configuration"
```

### 5. Document Custom Resources

When creating custom agents/skills/commands, include:
- Clear description of when to use
- Examples of typical invocations
- Dependencies on other resources

### 6. Keep Agents Focused

Following Unix philosophy, agents should do one thing well. Create multiple focused agents rather than one monolithic agent.

---

## Troubleshooting

### "Agent not found"

```bash
codekit agents add nonexistent-agent
# Error: Agent 'nonexistent-agent' not found in bundled templates
```

**Solution**: Check available agents with `codekit agents list`

### "Already installed"

```bash
codekit agents add typescript-expert
# Error: Agent 'typescript-expert' is already installed
```

**Solution**: Use `--force` to overwrite: `codekit agents add typescript-expert --force`

### "Permission denied"

```bash
codekit agents add react-expert --global
# Error: Permission denied writing to ~/.claude/agents/
```

**Solution**: Check permissions on `~/.claude/` directory

### Agent Not Triggering in Claude Code

If an installed agent isn't being invoked:

1. Verify it's installed: `codekit agents list`
2. Check the description includes appropriate trigger keywords
3. Ensure no conflicting agent at different scope
4. Restart Claude Code session

### Skill Scripts Not Executing

If skill helper scripts aren't running:

1. Check script has execute permission: `chmod +x .claude/skills/*/scripts/*`
2. Verify shebang line in script: `#!/usr/bin/env python3`
3. Check script path in SKILL.md instructions

---

## Quick Reference

### Common Commands

```bash
# Initialize
codekit init
codekit init --global

# Agents
codekit agents list
codekit agents add <name>
codekit agents remove <name>

# Skills
codekit skills list
codekit skills add <name>
codekit skills remove <name>

# Commands
codekit commands list
codekit commands add <name>
codekit commands remove <name>
```

### Common Flags

| Flag | Short | Description |
|------|-------|-------------|
| `--global` | `-g` | Use global `~/.claude/` scope |
| `--force` | `-f` | Overwrite existing / skip confirmations |
| `--dry-run` | | Preview without making changes |
| `--verbose` | `-v` | Show detailed output |
| `--help` | `-h` | Show help for command |

### Directory Locations

| Scope | Path |
|-------|------|
| Project | `./.claude/` |
| Global | `~/.claude/` |
| Bundled templates | `<codekit>/templates/` |
