---
description: Analyze git status and provide insights about current project state
category: git
allowed-tools: Bash(git:*), Read
---

# Git Status

Analyze the current git status and provide insights.

## Steps:

1. Get comprehensive status:
   !git status -sb

2. Check for any uncommitted changes:
   !git diff --stat

3. Check branch status relative to remote:
   !git log --oneline @{u}.. 2>/dev/null || echo "No upstream set"

4. Summarize:
   - Current branch
   - Uncommitted changes
   - Commits ahead/behind remote
   - Any merge conflicts
   - Suggested next actions
