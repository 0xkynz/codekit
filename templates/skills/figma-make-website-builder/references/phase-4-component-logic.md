---
title: Component Logic
impact: HIGH
tags: frontend, state-management, forms, validation, react, components
---

# Phase 4 — Component Logic

**Role:** Act as a Frontend Architect.

## Purpose

Design logic for interactive components identified in Phase 1. For each component, provide state machines, data flow, error handling, and React component structure.

## Interactive Components

### 1. Multi-Step Form

**State machine:**
```
States: idle → step1 → step2 → step3 → submitting → success | error
Events: NEXT, BACK, SUBMIT, RETRY, RESET
```

**Data flow:**
```typescript
// Form state
interface FormState {
  currentStep: number;
  totalSteps: number;
  data: Record<string, unknown>;
  errors: Record<string, string>;
  isSubmitting: boolean;
  isComplete: boolean;
}

// Per-step validation
function validateStep(step: number, data: FormState['data']): Record<string, string>;

// Progress indicator
function getProgress(current: number, total: number): number; // 0-100
```

**Validation strategy:**
- Validate on blur (individual fields)
- Validate on step transition (all fields in current step)
- Show inline errors below fields
- Disable "Next" until current step is valid
- Show progress bar with step labels

**Error handling:**
- Field-level: inline message below input, red border
- Step-level: summary at top of step
- Submission: toast notification + retry button
- Network: offline detection, auto-retry with backoff

**Loading states:**
- Step transition: skeleton of next step (200ms delay before showing)
- Submission: button spinner + disabled form
- Success: checkmark animation → redirect or confirmation

### 2. Dynamic Pricing Calculator

**Data flow:**
```typescript
interface PricingState {
  plan: 'starter' | 'pro' | 'enterprise';
  billingCycle: 'monthly' | 'annual';
  seats: number;
  addons: string[];
  total: number;
  savings: number;
}

// Price formula
function calculatePrice(state: PricingState): { monthly: number; annual: number; savings: number };

// Real-time updates on any input change
// Debounce slider inputs (100ms)
```

**Interactive elements:**
- Plan toggle (3 options)
- Billing cycle switch (monthly/annual with savings badge)
- Seat slider or number input (1-100+)
- Addon checkboxes
- Live total display with breakdown

**Edge cases:**
- Minimum 1 seat
- Enterprise: "Contact us" instead of price
- Annual discount badge shows percentage saved
- Currency formatting (locale-aware)

### 3. Search with Filters

**Data flow:**
```typescript
interface SearchState {
  query: string;
  filters: Record<string, string[]>;
  sort: { field: string; direction: 'asc' | 'desc' };
  page: number;
  pageSize: number;
  results: Result[];
  totalCount: number;
  isLoading: boolean;
}

// Debounced search (300ms)
// URL sync for shareable filter state
// Faceted counts update with each filter change
```

**Features:**
- Instant search with debounce
- Faceted filters (checkbox groups)
- Active filter chips with remove
- Sort dropdown
- Pagination or infinite scroll
- Result count display
- Empty state with suggestions
- Loading skeletons (not spinners)

**Edge cases:**
- No results: show "No results for [query]. Try [suggestions]"
- Slow network: show skeleton after 200ms delay
- Filter produces 0 results: show filter causing 0, suggest removal
- URL state sync: back/forward navigation works with filters

### 4. User Dashboard

**Data flow:**
```typescript
interface DashboardState {
  user: User;
  stats: DashboardStats;
  recentActivity: Activity[];
  notifications: Notification[];
  isLoading: boolean;
}

// Parallel data fetching for independent sections
// Stale-while-revalidate caching
// Optimistic updates for CRUD operations
```

**Sections:**
- Welcome banner with user name + key stat
- Stats grid (4 cards with sparklines)
- Recent activity feed (infinite scroll)
- Quick actions (shortcut buttons)
- Notifications dropdown

**CRUD operations:**
- Create: modal form with validation
- Read: list/grid with pagination
- Update: inline edit or modal
- Delete: confirmation dialog with type-to-confirm for destructive actions

### 5. Authentication Flows

**State machine:**
```
Login:    idle → validating → authenticating → success | error
Signup:   idle → validating → creating → verifying → success | error
Reset:    idle → requesting → sent → resetting → success | error
```

**Login form:**
```typescript
interface LoginState {
  email: string;
  password: string;
  rememberMe: boolean;
  errors: Record<string, string>;
  isSubmitting: boolean;
}

// Validation: email format, password minimum length
// Error: "Invalid email or password" (never reveal which is wrong)
// Rate limiting: disable after 5 attempts, show countdown
// OAuth buttons: Google, GitHub, etc.
```

**Signup form:**
- Fields: name, email, password, confirm password
- Password strength meter (zxcvbn or similar)
- Terms of service checkbox
- Email verification flow after submission

**Password reset:**
- Step 1: Enter email → "If an account exists, we sent a reset link"
- Step 2: Token validation → new password form
- Step 3: Success → redirect to login

## React Component Structure Template

For each interactive component, generate:

```typescript
// hooks/useComponentName.ts — state and logic
export function useComponentName(options: Options) {
  // State management
  // Event handlers
  // Side effects
  // Return: { state, actions, computed }
}

// components/ComponentName.tsx — presentation
export function ComponentName({ ...props }: ComponentNameProps) {
  const { state, actions } = useComponentName(props);
  // Render UI based on state
}

// components/ComponentName.loading.tsx — skeleton
export function ComponentNameSkeleton() {
  // Loading placeholder
}

// components/ComponentName.error.tsx — error boundary
export function ComponentNameError({ error, retry }: ErrorProps) {
  // Error display with retry
}
```

## Next Phase

Pass component specifications to [Phase 5 — Figma Make Prompt Engineering](phase-5-prompt-engineering.md).
