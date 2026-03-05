# Better Auth — Setup Guide

Step-by-step guide for adding Better Auth to any TypeScript/JavaScript project.

---

## Phase 1: Planning

Before writing code, scan the project and gather requirements.

### Step 1: Detect Project Stack

Scan for:
- **Framework** — `next.config`, `svelte.config`, `nuxt.config`, `astro.config`, `vite.config`, Express/Hono entry files
- **Database/ORM** — `prisma/schema.prisma`, `drizzle.config`, deps (`pg`, `mysql2`, `better-sqlite3`, `mongoose`)
- **Existing auth** — `next-auth`, `lucia`, `clerk`, `supabase/auth`, `firebase/auth` in imports
- **Package manager** — `pnpm-lock.yaml`, `yarn.lock`, `bun.lockb`, `package-lock.json`

### Step 2: Key Planning Questions

1. **Project type** — New project | Adding auth to existing | Migrating from another auth
2. **Framework** — Next.js App Router | Next.js Pages | SvelteKit | Nuxt | Astro | Express | Hono | SolidStart
3. **Database & ORM** — PostgreSQL/MySQL/SQLite with Prisma/Drizzle/direct driver, or MongoDB
4. **Auth methods** — Email/password | Social OAuth | Magic link | Passkey | Phone number (multi-select)
5. **Social providers** — Google | GitHub | Apple | Microsoft | Discord | Twitter/X (if OAuth selected)
6. **Email verification** — Yes/No (if email/password selected)
7. **Email provider** — Resend | Console.log mock (if verification or reset needed)
8. **Features/plugins** — 2FA | Organizations | Admin | API bearer tokens | Password reset (multi-select)
9. **Auth pages** — Sign in | Sign up | Forgot password | Reset password | Email verification
10. **UI style** — Minimal | Centered card | Split layout | Glassmorphism

### Step 3: Summarize Plan

```
## Auth Implementation Plan

- **Framework:** Next.js (App Router)
- **Database:** PostgreSQL via Prisma
- **Auth methods:** Email/password, Google OAuth, GitHub OAuth
- **Plugins:** 2FA, Organizations, Email verification
- **UI:** Centered card style

### Steps
1. Install `better-auth` and `@better-auth/cli`
2. Create `lib/auth.ts` with server config
3. Create `lib/auth-client.ts` with React client
4. Set up route handler at `app/api/auth/[...all]/route.ts`
5. Configure Prisma adapter and generate schema
6. Add Google & GitHub OAuth providers
7. Enable `twoFactor` and `organization` plugins
8. Set up email verification handler
9. Run migrations
10. Create sign-in / sign-up pages
```

---

## Phase 2: Implementation

### Decision Tree

```
Is this a new/empty project?
├─ YES → New Project Setup
│   1. Install better-auth (+ scoped packages per plan)
│   2. Create auth.ts with all planned config
│   3. Create auth-client.ts with framework client
│   4. Set up route handler
│   5. Set up environment variables
│   6. Run CLI migrate/generate
│   7. Add plugins from plan
│   8. Create auth UI pages
│
├─ MIGRATING → Migration
│   1. Audit current auth for feature gaps
│   2. Plan incremental migration
│   3. Install better-auth alongside existing auth
│   4. Migrate routes, then session logic, then UI
│   5. Remove old auth library
│   6. See migration guides in docs
│
└─ ADDING → Add to Existing Project
    1. Analyze project structure
    2. Install better-auth
    3. Create auth config matching plan
    4. Add route handler
    5. Run schema migrations
    6. Integrate into existing pages
    7. Add planned plugins and features
```

---

## Installation

**Core:**

```bash
npm install better-auth
```

**Scoped packages (as needed):**

| Package | Use case |
|---------|----------|
| `@better-auth/passkey` | WebAuthn/Passkey auth |
| `@better-auth/sso` | SAML/OIDC enterprise SSO |
| `@better-auth/stripe` | Stripe payments integration |
| `@better-auth/scim` | SCIM user provisioning |
| `@better-auth/expo` | React Native/Expo support |

---

## Framework-Specific Route Handlers

### Next.js (App Router)

```ts
// app/api/auth/[...all]/route.ts
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
```

Add `nextCookies()` for Server Component session access:

```ts
// lib/auth.ts
import { nextCookies } from "better-auth/next-js";

export const auth = betterAuth({
  plugins: [nextCookies()],
});
```

### Next.js (Pages Router)

```ts
// pages/api/auth/[...all].ts
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export default toNextJsHandler(auth);
```

### Express

```ts
import { toNodeHandler } from "better-auth/node";
import { auth } from "./auth";

app.all("/api/auth/*", toNodeHandler(auth));
```

### Hono

```ts
import { auth } from "./auth";

app.all("/api/auth/*", (c) => auth.handler(c.req.raw));
```

### SvelteKit

```ts
// src/hooks.server.ts
import { auth } from "$lib/auth";
import { svelteKitHandler } from "better-auth/svelte-kit";

export const handle = svelteKitHandler({ auth, handle });
```

---

## Database Adapter Setup

### Direct Connection (PostgreSQL)

```ts
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export const auth = betterAuth({
  database: pool,
});
```

### Prisma Adapter

```ts
import { PrismaClient } from "@prisma/client";
import { prismaAdapter } from "better-auth/adapters/prisma";

const prisma = new PrismaClient();

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
});
```

After setup: `npx @better-auth/cli@latest generate --output prisma/schema.prisma && npx prisma migrate dev`

### Drizzle Adapter

```ts
import { drizzle } from "drizzle-orm/node-postgres";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

const db = drizzle(pool);

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),
});
```

After setup: `npx @better-auth/cli@latest generate --output src/db/auth-schema.ts && npx drizzle-kit push`

### MongoDB Adapter

```ts
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "better-auth/adapters/mongodb";

const client = new MongoClient(process.env.MONGODB_URI!);
const db = client.db("myapp");

export const auth = betterAuth({
  database: mongodbAdapter(db),
});
```

---

## User & Account Config

```ts
user: {
  modelName: "user",                    // ORM model name
  fields: { email: "email_address" },   // Column mapping
  additionalFields: {
    role: { type: "string", defaultValue: "user", input: false },
  },
  changeEmail: { enabled: true },
  deleteUser: { enabled: true },
},
account: {
  accountLinking: { enabled: true },    // Multi-provider linking
  storeAccountCookie: true,             // For stateless OAuth
},
```

**Required for registration:** `email` and `name` fields.

---

## Email Flows

### Verification Email

```ts
emailVerification: {
  sendVerificationEmail: async ({ user, url, token }, request) => {
    await sendEmail({
      to: user.email,
      subject: "Verify your email address",
      text: `Click to verify: ${url}`,
    });
  },
  sendOnSignUp: true,
  sendOnSignIn: false,
}
```

### Password Reset Email

```ts
emailAndPassword: {
  enabled: true,
  sendResetPassword: async ({ user, url, token }, request) => {
    await sendEmail({
      to: user.email,
      subject: "Reset your password",
      text: `Click to reset: ${url}`,
    });
  },
  resetPasswordTokenExpiresIn: 60 * 60,  // 1 hour default
  revokeSessionsOnPasswordReset: true,
}
```

---

## Auth UI Patterns

### Sign In

```ts
const handleSignIn = async (email: string, password: string) => {
  const { data, error } = await authClient.signIn.email(
    { email, password },
    {
      onSuccess(ctx) {
        if (ctx.data.twoFactorRedirect) {
          window.location.href = "/2fa";
          return;
        }
        window.location.href = "/dashboard";
      },
    }
  );
};
```

### Social Sign In

```ts
await authClient.signIn.social({
  provider: "google",
  callbackURL: "https://app.example.com/dashboard",
});
```

### Session Check (React)

```tsx
const { data: session, isPending } = useSession();

if (isPending) return <Loading />;
if (!session) redirect("/sign-in");
```

### Session Check (Server)

```ts
const session = await auth.api.getSession({
  headers: await headers(),
});
if (!session) redirect("/sign-in");
```

---

## Post-Implementation Checklist

- [ ] Environment variables set (`BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `DATABASE_URL`)
- [ ] OAuth provider credentials configured in provider dashboards
- [ ] Redirect URIs registered with OAuth providers
- [ ] Database migrations applied
- [ ] Email sending configured (or mocked for development)
- [ ] Protected routes check session and redirect
- [ ] Error handling for all auth operations
- [ ] Security checklist reviewed (see main SKILL.md)
