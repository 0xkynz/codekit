# ESLint Fix — Style Guide Reference

## Common Patterns

### Unused Imports
```typescript
// Bad
import { useState, useEffect, useCallback } from 'react';
// only useState is used

// Good
import { useState } from 'react';
```

### Unused Variables
```typescript
// Bad
const result = fetchData();
// result never used

// Good — remove if truly unused
fetchData();

// Good — prefix with _ if intentionally unused (e.g., destructuring)
const [_first, second] = pair;
```

### Shadowed Variables
```typescript
// Bad
const name = 'outer';
function greet() {
  const name = 'inner'; // shadows outer
}

// Good
const outerName = 'outer';
function greet() {
  const name = 'inner';
}
```

### Prefer const
```typescript
// Bad
let count = 5;
// count is never reassigned

// Good
const count = 5;
```

### No Explicit Any
```typescript
// Bad
function process(data: any) { ... }

// Good
function process(data: Record<string, unknown>) { ... }
function process(data: UserInput) { ... }
```

### Consistent Return
```typescript
// Bad
function check(value: number) {
  if (value > 0) return true;
  // implicit undefined return
}

// Good
function check(value: number): boolean {
  if (value > 0) return true;
  return false;
}
```

### No Floating Promises
```typescript
// Bad
async function save() { ... }
save(); // unhandled promise

// Good
await save();
// or
void save(); // explicitly fire-and-forget
```

## Anti-Patterns to Avoid

### Never suppress with comments
```typescript
// NEVER DO THIS
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const x = 5;
```

### Never weaken the config
```javascript
// NEVER DO THIS in eslint.config.js
rules: {
  '@typescript-eslint/no-unused-vars': 'off', // hiding problems
}
```

### Never change logic to fix style
```typescript
// If a function is complex and triggers a rule,
// fix the style issue without changing behavior.
// When in doubt, flag for human review.
```
