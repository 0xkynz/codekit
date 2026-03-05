# codekit - Gemini CLI Project Context

> **IMPORTANT: Always read the `memory-bank/` directory at the start of each session. MUST UPDATE memory-bank/activeContext.md and memory-bank/progress.md AFTER EACH SESSION**
> This contains essential project context, current progress, and active decisions.

This file provides project context and rules for Google Gemini CLI.

## Project Summary

**Name:** codekit
**Type:** typescript application
**Package Manager:** bun
**Runtime:** bun

## Technology Stack

### Languages
- typescript

### Frameworks
- None

### Build Tools
- None

### Testing
- Not configured

## Dependencies

**JavaScript (package.json):**
- Production (4): commander, @clack/prompts, yaml, chalk
- Dev (2): @types/bun, typescript

## Project Structure

```
codekit/
├── src/          # Source code
├── tests/         # Tests
├── docs/         # Documentation
├── .gitignore
├── package.json
├── tsconfig.json
```

## Code Conventions

- **TypeScript:** Yes - use TypeScript for all new code



- **Linter:** Not configured
- **Formatter:** Not configured

## Development Commands

```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Run tests
bun run test

# Build for production
bun run build
```

## Installed Skills

### Devops
- **CLI Development Expert**: Expert in building npm package CLIs with Unix philosophy, argument parsing, i...

### General
- **find-skills**: Helps users discover and install agent skills when they ask questions like "h...

### Git
- **Git Expert**: Git workflow expert for merge conflicts, branching strategies, history rewrit...

### Typescript
- **TypeScript Expert**: TypeScript language expert for type system, generics, module resolution, and ...

### Workflow
- **Project Setup**: Auto-detect project tech stack and install matching codekit skills. Use when ...
- **Skill Creator**: Guide for creating effective skills that extend Claude's capabilities with sp...
- **Memory Bank**: Persistent project documentation system that maintains context across session...
- **Cook Workflow**: Structured workflow orchestration adapted to project type — backend (Plan/Cod...

## Guidelines for Gemini

### Memory Bank (Critical)
**You MUST read the `memory-bank/` directory at the start of EVERY session.** The memory bank contains:
- `projectbrief.md` - Core requirements and goals
- `productContext.md` - Problem and solution context
- `techContext.md` - Technical setup and dependencies
- `systemPatterns.md` - Architecture and design patterns
- `activeContext.md` - Current work focus and recent changes
- `progress.md` - Completed work and known issues

### Workflow
1. **Start of session:** Read all memory-bank files first
2. **Before coding:** Check activeContext.md for current focus
3. **After changes:** Update activeContext.md and progress.md

### Code Guidelines
1. **Follow existing patterns** - Match the code style and architecture already in use
2. **Type safety** - Ensure proper TypeScript types
3. **Testing** - Write tests for new functionality using the project's test framework
4. **Code quality** - Write clean, readable code
5. **Dependencies** - Prefer using existing dependencies over adding new ones
