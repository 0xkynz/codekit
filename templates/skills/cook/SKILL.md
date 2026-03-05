---
name: cook
description: Auto-generated workflow orchestration skill. The setup skill generates this file based on your detected project type, tech stack, and conventions. Contains project-specific phases, review checklists, and test strategies with memory-bank session continuity.
---

# Cook — Workflow Orchestration

This skill is **auto-generated** by the `setup` skill based on your project's detected type and tech stack.

To regenerate, run the setup skill again or ask: "setup skills for this project"

## How It Works

The setup skill:
1. Detects your project type (backend, frontend, mobile, fullstack, CLI, library)
2. Reads the matching cook reference template (`cook-backend`, `cook-frontend`, etc.)
3. Generates this file with your actual framework names, test commands, and conventions
4. Includes memory-bank session continuity

## Reference Templates

The following cook variants are available as base templates:

| Project Type | Template | Phases |
|-------------|----------|--------|
| Backend | `cook-backend` | Plan → Code → Review → Test |
| Frontend | `cook-frontend` | Plan → Design → Code → Review → Test |
| Mobile | `cook-mobile` | Plan → Design → Code → Review → Test |
| Fullstack | `cook-fullstack` | Plan → Design → Code API → Code UI → Review → Test |
| CLI | `cook-cli` | Plan → Code → Review → Test |
| Library | `cook-library` | Plan → Design → Code → Review → Test |

## To Regenerate

```bash
# Re-run setup to regenerate this file
# Or manually install a base variant:
codekit skills add cook-backend
codekit skills add cook-frontend
codekit skills add cook-fullstack
# etc.
```
