---
description: Create a git commit following the project's established style
category: git
allowed-tools: Bash(git:*), Read, Edit
argument-hint: "[optional message]"
---

# Git Commit

Create a git commit following the project's established conventions.

## Steps:

1. Check current status:
   !git status --porcelain

2. If there are changes, analyze them:
   !git diff --stat

3. Look for commit conventions in CLAUDE.md or recent commit history:
   !git log --oneline -10

4. Stage and commit with an appropriate message following the project's style

## Commit Message Guidelines:

- If the project uses conventional commits: `type(scope): message`
- If the project uses ticket numbers: `PROJ-123: message`
- Otherwise: Use clear, imperative mood messages

## Safety Checks:

- Never commit sensitive files (.env, credentials, etc.)
- Ensure no debug code is being committed
- Verify tests pass before committing
