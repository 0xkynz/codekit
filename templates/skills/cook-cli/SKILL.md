---
name: cook-cli
description: Workflow orchestration for CLI projects (commander, yargs, oclif). Structured phases — Plan, Code, Review, Test — with memory-bank integration for session continuity.
---

# Cook — CLI Workflow

Structured workflow for CLI projects. Every non-trivial task flows through ordered phases.

```
Plan → Code → Review → Test
```

---

## Memory Bank — Required for Every Session

**At the start of EVERY session**, read all files in `memory-bank/`:

1. `projectbrief.md` — Core requirements and goals
2. `productContext.md` — Problem and solution context
3. `techContext.md` — Technical setup and dependencies
4. `systemPatterns.md` — Architecture and design patterns
5. `activeContext.md` — Current work focus and recent changes
6. `progress.md` — Completed work and known issues

If `memory-bank/` does not exist, create it with the files above based on what you learn from the codebase.

**After completing work** (end of Test phase or any stopping point), update:

- `activeContext.md` — What was done, current state, next steps
- `progress.md` — Mark completed items, add new known issues

This ensures continuity across sessions. Never skip this step.

---

## [PLAN] Plan

1. Read requirements. Define the command interface (args, flags, output).
2. Identify affected commands, options, and help text.
3. Define acceptance criteria including error messages and edge cases.

**Output:** Numbered plan with command signatures and acceptance criteria.
**Rule:** No code in this phase.

## [CODE] Code

1. Implement command parsing and validation first.
2. Then core logic.
3. Then output formatting (stdout for data, stderr for messages).
4. Handle errors gracefully — exit codes, helpful error messages.

**Rules:**
- Match existing command patterns and naming conventions.
- No features beyond scope. No premature abstractions.

## [REVIEW] Review

1. **Interface** — Does `--help` reflect the changes? Are flags consistent with existing commands?
2. **Errors** — Do invalid inputs produce clear error messages? Proper exit codes?
3. **Output** — Is stdout machine-parseable when `--json` is used? Is stderr used for human messages?
4. **Types** — Are types precise? No `any` leaks?

Fix issues immediately. If a design flaw is found, loop back to Plan.

## [TEST] Test

1. **Unit tests** — Test core logic in isolation.
2. **CLI tests** — Test command execution with various args and flags.
3. Run the command manually with edge case inputs.
4. Run the full test suite and type checker.

**Rules:**
- Test behavior, not implementation. Test error paths, not just happy paths.
- Never mark done with failing tests.

---

## Iteration

If any phase reveals problems:
- **Test failures from a bug** → Fix in Code, re-run Review + Test.
- **Review reveals missing requirements** → Loop back to Plan.
- **User feedback changes scope** → Restart from Plan.

Always note which phase you're returning to and why.

## Phase Markers

Prefix progress with the current phase:

```
[PLAN] Analyzing requirements...
[CODE] Implementing command logic...
[REVIEW] Self-reviewing changes...
[TEST] Running CLI tests...
```
