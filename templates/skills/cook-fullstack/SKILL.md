---
name: cook-fullstack
description: Workflow orchestration for fullstack projects (Next.js, Nuxt, SvelteKit — API + UI). Structured phases — Plan, Design, Code API, Code UI, Review, Test — with memory-bank integration for session continuity.
---

# Cook — Fullstack Workflow

Structured workflow for fullstack projects. Every non-trivial task flows through ordered phases.

```
Plan → Design → Code (API first) → Code (UI) → Review → Test
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

1. Read requirements. Identify both API and UI changes needed.
2. Break into backend subtasks and frontend subtasks separately.
3. Define the API contract (endpoints, request/response shapes) as the boundary.
4. Define acceptance criteria for the full user flow.

**Output:** Numbered plan with API contract and component changes.
**Rule:** No code in this phase.

## [DESIGN] Design

1. Design API contract first — it's the bridge between layers.
2. Define component hierarchy and data fetching strategy.
3. Plan optimistic UI, loading states, and error handling.

**Output:** API contract, component signatures, and data flow.
**Rule:** Match existing patterns in both layers.

## [CODE] Code — API First

1. Implement backend: models → services → routes.
2. Validate the API works (test endpoint manually or with integration test).
3. **Then** implement frontend against the real API.
4. Wire up data fetching, mutations, and error handling.

**Rule:** Backend must be working before building the frontend against it.

## [REVIEW] Review

**Backend checks:**
1. **API contract** — Do endpoints match the spec? Correct HTTP methods and status codes?
2. **Validation** — Is all user input validated before reaching business logic?
3. **Security** — No SQL injection, no exposed secrets, proper auth checks?
4. **Error handling** — Do all error paths return meaningful responses?

**Frontend checks:**
5. **Visual** — Does it match the requirements? Responsive on mobile/tablet/desktop?
6. **Accessibility** — Keyboard navigable? Screen reader friendly?
7. **State** — No unnecessary re-renders? Proper cleanup of effects/subscriptions?

**Integration checks:**
8. **Contract** — Does the frontend match the API contract exactly?
9. **Error propagation** — Do API errors surface as user-friendly messages?
10. **Loading** — Are there loading states for every async operation?

Fix issues immediately. If a design flaw is found, loop back to Design.

## [TEST] Test

1. **Backend:** Unit tests for services + integration tests for API endpoints.
2. **Frontend:** Component tests for UI + test data fetching with mocked API.
3. **End-to-end:** Test the full user flow if E2E tests exist in the project.
4. Run type checker and linter for both layers.

**Rules:**
- Test behavior, not implementation. Test error paths, not just happy paths.
- Never mark done with failing tests.

---

## Iteration

If any phase reveals problems:
- **Test failures from a bug** → Fix in Code, re-run Review + Test.
- **Review reveals missing requirements** → Loop back to Plan.
- **Design flaw found during Code** → Loop back to Design.
- **User feedback changes scope** → Restart from Plan.

Always note which phase you're returning to and why.

## Phase Markers

Prefix progress with the current phase:

```
[PLAN] Analyzing requirements...
[DESIGN] Defining API contract and components...
[CODE] Implementing API layer...
[CODE] Implementing UI layer...
[REVIEW] Self-reviewing changes...
[TEST] Running integration tests...
```
