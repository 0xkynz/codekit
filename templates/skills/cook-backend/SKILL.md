---
name: cook-backend
description: Workflow orchestration for backend projects (API routes, services, models). Structured phases — Plan, Code, Review, Test — with memory-bank integration for session continuity.
---

# Cook — Backend Workflow

Structured workflow for backend projects. Every non-trivial task flows through ordered phases.

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

1. Read requirements. Ask if ambiguous.
2. Identify affected routes, services, models, and migrations.
3. Break into subtasks. Define acceptance criteria.
4. Identify API contract changes (request/response shapes).

**Output:** Numbered plan with affected files and acceptance criteria.
**Rule:** No code in this phase.

## [CODE] Code

1. Implement data layer first (models, migrations, schemas).
2. Then service/business logic.
3. Then API routes/controllers.
4. Handle errors at boundaries — validate input, catch DB errors, return proper status codes.
5. Update related code (types, middleware, configs).

**Rules:**
- Match existing patterns. Don't invent new conventions.
- No features beyond scope. No premature abstractions.

## [REVIEW] Review

1. **API contract** — Do endpoints match the spec? Correct HTTP methods and status codes?
2. **Validation** — Is all user input validated before reaching business logic?
3. **Security** — No SQL injection, no exposed secrets, proper auth checks?
4. **Error handling** — Do all error paths return meaningful responses?
5. **Types** — Are types precise? No `any` leaks? Proper null handling?
6. **Performance** — No N+1 queries? Proper indexing considered?

Fix issues immediately. If a design flaw is found, loop back to Plan.

## [TEST] Test

1. **Unit tests** — Test service/business logic in isolation. Mock external dependencies.
2. **Integration tests** — Test API endpoints end-to-end (request → response). Test with a real or in-memory database where possible.
3. Run the full test suite — ensure nothing is broken.
4. Run type checking and linting.

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
[CODE] Implementing service layer...
[REVIEW] Self-reviewing changes...
[TEST] Running unit and integration tests...
```
