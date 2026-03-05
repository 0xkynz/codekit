---
name: cook-mobile
description: Workflow orchestration for mobile projects (React Native, Expo, iOS, Android). Structured phases — Plan, Design, Code, Review, Test — with memory-bank integration for session continuity.
---

# Cook — Mobile Workflow

Structured workflow for mobile projects. Every non-trivial task flows through ordered phases.

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
2. Identify affected screens, navigation, and native modules.
3. Break into subtasks. Define acceptance criteria for both iOS and Android.
4. Identify platform-specific behavior needed.

**Output:** Numbered plan with affected screens and acceptance criteria.
**Rule:** No code in this phase.

## [DESIGN] Design

1. Define screen components and navigation flow.
2. Plan gestures, animations, and platform-specific UI.
3. Identify shared vs platform-specific code.

**Output:** Screen hierarchy, navigation map, and platform-specific decisions.
**Rule:** Match existing component patterns. Follow platform conventions.

## [CODE] Code

1. Build shared components first, then platform-specific code.
2. Handle offline state, slow networks, and permission prompts.
3. Use platform-specific patterns where needed (SafeAreaView, StatusBar, etc.).
4. Test on both platforms during development.

**Rules:**
- Match existing component patterns and naming conventions.
- Handle both iOS and Android edge cases.

## [REVIEW] Review

1. **Cross-platform** — Works on both iOS and Android? Platform-specific edge cases handled?
2. **Performance** — No JS thread blocking? FlatList/FlashList for long lists? Memoization where needed?
3. **UX** — Proper keyboard avoidance? Touch targets >=44pt? Loading indicators?
4. **Permissions** — Camera, location, notifications handled gracefully with denial fallbacks?
5. **Types** — Props typed correctly? No `any`?

Fix issues immediately. If layout/design is wrong, loop back to Design.

## [TEST] Test

1. **Component tests** — Test screen components and interactions.
2. **Platform test** — Run on iOS simulator and Android emulator.
3. Run full test suite and type checker.

**Rule:** Test user behavior across both platforms, not implementation details.

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
[DESIGN] Defining screen flow...
[CODE] Implementing components...
[REVIEW] Self-reviewing changes...
[TEST] Running on simulators...
```
