---
name: eslint-fix
description: Analyze and fix ESLint errors across the project. Use when the user asks to clean up code style, fix linting issues, or perform a quality review.
argument-hint: [directory-or-file]
context: fork
agent: general-purpose
allowed-tools: Read, Write, Bash(npx eslint ), mcp__eslint__
---

# ESLint Fixer Skill

This skill provides a structured workflow for resolving linting violations while maintaining code quality and architectural consistency.

## Quick Start

To fix all issues in the current project, simply run:

```
/eslint-fix
```

## Instructions

### 1. Diagnostic Triage

First, understand the scope of the issues. Use the analyze script to generate a report grouped by directory:

```bash
bash $SKILL_PATH/scripts/analyze_errors.sh $ARGUMENTS
```

### 2. Execution Strategy

Choose a strategy based on the total error count:

- **Direct Fix (≤ 20 errors):** Iterate through files sequentially. For each file, read the content, identify the specific rule violation, and modify the code to comply.

- **Parallel Fix (> 20 errors):** If the codebase has high-volume violations, spawn specialized subagents for each major directory to process files in parallel.

### 3. Iterative Verification Loop

For every modification, you MUST verify the fix immediately:

1. Apply the code change.
2. Run `npx eslint <file-path>` specifically for that file.
3. If errors persist, refactor again. DO NOT use `eslint-disable` comments to bypass rules.

### 4. Final Summary

Once complete, provide a report including:

- Total files processed and fixed.
- A breakdown of the specific rules addressed (e.g., "Fixed 5 unused-imports, 2 shadowed-variables").
- Any remaining errors that require human architectural decisions.

## Constraints & Rules

- **No Suppression:** Never add `// eslint-disable` or modify `eslint.config.js` to hide errors.
- **Functional Parity:** Ensure that fixes do not change the underlying logic or performance of the code.
- **Style Alignment:** Follow existing project patterns (e.g., functional programming, specific naming conventions) found in `CLAUDE.md`.
