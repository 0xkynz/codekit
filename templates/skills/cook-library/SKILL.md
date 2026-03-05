---
name: cook-library
description: Workflow orchestration for library projects (npm packages, exports, public API). Structured phases — Plan, Design, Code, Review, Test — with memory-bank integration for session continuity.
---

# Cook — Library Workflow

Structured workflow for library projects. Every non-trivial task flows through ordered phases.

```
Plan → Design → Code → Review → Test
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

1. Read requirements. Define the public API surface change.
2. Identify breaking vs non-breaking changes.
3. Define acceptance criteria including backwards compatibility.

**Output:** Numbered plan with API surface changes and acceptance criteria.
**Rule:** No code in this phase.

## [DESIGN] Design

1. Design the public API — function signatures, types, options.
2. Consider ergonomics — is it obvious how to use? Minimal boilerplate?
3. Plan for tree-shaking — avoid side effects in module scope.

**Output:** Public API signatures and type definitions.
**Rule:** API should be easy to use correctly, hard to use incorrectly.

## [CODE] Code

1. Implement internal logic first.
2. Then the public API surface.
3. Export types alongside runtime code.
4. Update JSDoc/TSDoc for public APIs.

**Rules:**
- Match existing patterns and naming conventions.
- No features beyond scope. No premature abstractions.

## [REVIEW] Review

1. **Public API** — Is it minimal? Easy to use correctly, hard to use incorrectly?
2. **Types** — Are exported types precise and well-named?
3. **Breaking changes** — Anything that would break existing consumers?
4. **Bundle** — No unnecessary dependencies pulled in? Tree-shakeable?

Fix issues immediately. If API design is wrong, loop back to Design.

## [TEST] Test

1. **Unit tests** — Full coverage of public API. Test edge cases and error paths.
2. **Type tests** — Verify type inference works as expected (if applicable).
3. Run the full test suite, type checker, and linter.

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
[DESIGN] Designing public API...
[CODE] Implementing library...
[REVIEW] Self-reviewing changes...
[TEST] Running test suite...
```
