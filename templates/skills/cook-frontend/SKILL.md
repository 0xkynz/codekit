---
name: cook-frontend
description: Workflow orchestration for frontend projects (React, Vue, Svelte, components, CSS). Structured phases — Plan, Design, Code, Review, Test — with memory-bank integration for session continuity.
---

# Cook — Frontend Workflow

Structured workflow for frontend projects. Every non-trivial task flows through ordered phases.

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

1. Read requirements. Ask if ambiguous.
2. Identify affected components, pages, and state.
3. Break into subtasks. Define acceptance criteria including visual/UX requirements.
4. Identify data flow — where does data come from? What triggers re-renders?

**Output:** Numbered plan with component tree changes and acceptance criteria.
**Rule:** No code in this phase.

## [DESIGN] Design

1. Define component hierarchy and props interfaces.
2. Choose state management approach (local state, context, store).
3. Plan responsive behavior and accessibility.
4. Identify reusable vs one-off components.

**Output:** Component signatures, data flow, and layout approach.
**Rule:** Match existing component patterns. Don't create new design conventions.

## [CODE] Code

1. Build from leaf components up — smallest pieces first.
2. Implement layout and structure, then interactivity, then styling polish.
3. Handle loading, error, and empty states for every data-dependent view.
4. Ensure accessibility — semantic HTML, keyboard navigation, ARIA labels.

**Rules:**
- Match existing component patterns and naming conventions.
- No hardcoded strings for user-facing text if the project uses i18n.

## [REVIEW] Review

1. **Visual** — Does it match the requirements? Responsive on mobile/tablet/desktop?
2. **Accessibility** — Keyboard navigable? Screen reader friendly? Color contrast?
3. **State** — No unnecessary re-renders? Proper cleanup of effects/subscriptions?
4. **Types** — Props typed correctly? No `any`?
5. **Edge cases** — Loading states, error states, empty states, long text overflow?

Fix issues immediately. If layout/design is wrong, loop back to Design.

## [TEST] Test

1. **Component tests** — Render components, assert output and interactions. Use Testing Library patterns (query by role/label, not implementation).
2. **Visual check** — Run the dev server and manually verify the feature looks correct.
3. Run the full test suite and type checker.

**Rule:** Test user behavior ("user clicks submit, sees success message"), not implementation details.

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
[DESIGN] Defining component hierarchy...
[CODE] Implementing components...
[REVIEW] Self-reviewing changes...
[TEST] Running component tests...
```
