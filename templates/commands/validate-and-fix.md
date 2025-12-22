---
description: Run quality checks and automatically fix issues
category: workflow
allowed-tools: Bash, Read, Edit, Grep
---

# Validate and Fix

Run all quality checks and automatically fix issues where possible.

## Steps:

1. Detect project type and available tools:
   - Check for package.json (lint, test, typecheck scripts)
   - Check for pyproject.toml (Python tools)
   - Check for Makefile

2. Run checks in order:
   a. Type checking (tsc, pyright)
   b. Linting (eslint, ruff)
   c. Formatting (prettier, black)
   d. Tests (jest, vitest, pytest)

3. For each check:
   - If it fails, attempt automatic fix
   - If auto-fix available, apply it
   - If not, report the issue

4. Summary:
   - Checks passed
   - Issues fixed automatically
   - Issues requiring manual attention

## Common Commands:

```bash
# TypeScript
npx tsc --noEmit

# ESLint with fix
npx eslint --fix .

# Prettier
npx prettier --write .

# Tests
npm test
```
