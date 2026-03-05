---
name: better-auth
description: >
  Better Auth integration expert for TypeScript authentication — server config, client setup,
  database adapters, OAuth providers, plugins (2FA, organizations), session management, and
  security hardening. Use when adding auth to a project, configuring Better Auth, implementing
  login/signup flows, setting up OAuth, enabling 2FA, or securing auth endpoints.
---

# Better Auth Expert

You are an expert in Better Auth, a TypeScript-first, framework-agnostic authentication framework. You help developers integrate auth into their applications following best practices for security, type safety, and framework conventions.

**Always consult [better-auth.com/docs](https://better-auth.com/docs) for the latest API and code examples.**

## When Invoked

1. Identify the task — new auth setup, adding features, migrating, debugging, or security hardening.
2. Detect the project's framework, database, and existing auth (if any) from the codebase.
3. Apply the appropriate patterns from this skill and its reference files.
4. Validate security settings before considering the task complete.

---

## Quick Reference

### Environment Variables

```env
BETTER_AUTH_SECRET=<32+ chars, generate: openssl rand -base64 32>
BETTER_AUTH_URL=http://localhost:3000
DATABASE_URL=<connection string>
```

Only define `baseURL`/`secret` in config if env vars are NOT set.

### File Location

CLI looks for `auth.ts` in: `./`, `./lib`, `./utils`, or under `./src`. Use `--config` for custom path.

### CLI Commands

```bash
npx @better-auth/cli@latest migrate     # Apply schema (built-in adapter)
npx @better-auth/cli@latest generate    # Generate schema for Prisma/Drizzle
```

**Re-run after adding/changing plugins.**

---

## Core Server Config

Location: `lib/auth.ts` or `src/lib/auth.ts`

### Essential Options

| Option | Notes |
|--------|-------|
| `database` | Required. Connection or ORM adapter. |
| `emailAndPassword` | `{ enabled: true }` to activate |
| `socialProviders` | `{ google: { clientId, clientSecret }, ... }` |
| `plugins` | Array of feature plugins |
| `trustedOrigins` | CSRF whitelist for frontend domains |

### Standard Config

```ts
import { betterAuth } from "better-auth";

export const auth = betterAuth({
  database: pool,                          // pg.Pool, mysql2, better-sqlite3, or ORM adapter
  emailAndPassword: { enabled: true },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  trustedOrigins: ["https://app.example.com"],
});

export type Session = typeof auth.$Infer.Session;
```

### Database Adapters

| Database | Setup |
|----------|-------|
| PostgreSQL | Pass `pg.Pool` instance directly |
| MySQL | Pass `mysql2` pool directly |
| SQLite | Pass `better-sqlite3` or `bun:sqlite` instance |
| Prisma | `prismaAdapter(prisma, { provider: "postgresql" })` from `better-auth/adapters/prisma` |
| Drizzle | `drizzleAdapter(db, { provider: "pg" })` from `better-auth/adapters/drizzle` |
| MongoDB | `mongodbAdapter(db)` from `better-auth/adapters/mongodb` |

**Critical:** Better Auth uses adapter model names, NOT underlying table names. If Prisma model is `User` mapping to table `users`, use `modelName: "user"` (Prisma reference), not `"users"`.

---

## Client Config

Location: `lib/auth-client.ts` or `src/lib/auth-client.ts`

### Import by Framework

| Framework | Import |
|-----------|--------|
| React/Next.js | `better-auth/react` |
| Vue | `better-auth/vue` |
| Svelte | `better-auth/svelte` |
| Solid | `better-auth/solid` |
| Vanilla JS | `better-auth/client` |

```ts
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
  plugins: [],  // Client-side plugin counterparts go here
});

export const { signIn, signUp, signOut, useSession } = authClient;
```

For separate client/server projects, pass the server auth type: `createAuthClient<typeof auth>()`.

---

## Route Handler Setup

| Framework | File | Handler |
|-----------|------|---------|
| Next.js App Router | `app/api/auth/[...all]/route.ts` | `toNextJsHandler(auth)` -> export `{ GET, POST }` |
| Next.js Pages | `pages/api/auth/[...all].ts` | `toNextJsHandler(auth)` -> default export |
| Express | Any file | `app.all("/api/auth/*", toNodeHandler(auth))` |
| SvelteKit | `src/hooks.server.ts` | `svelteKitHandler(auth)` |
| SolidStart | Route file | `solidStartHandler(auth)` |
| Hono | Route file | `auth.handler(c.req.raw)` |

**Next.js Server Components:** Add `nextCookies()` plugin to auth config.

---

## Database Migrations

| Adapter | Command |
|---------|---------|
| Built-in Kysely | `npx @better-auth/cli@latest migrate` (applies directly) |
| Prisma | `npx @better-auth/cli@latest generate --output prisma/schema.prisma` then `npx prisma migrate dev` |
| Drizzle | `npx @better-auth/cli@latest generate --output src/db/auth-schema.ts` then `npx drizzle-kit push` |

**Re-run after adding plugins.**

---

## Session Management

### Storage Priority

1. If `secondaryStorage` defined -> sessions go there (not DB)
2. Set `session.storeSessionInDatabase: true` to also persist to DB
3. No database + `cookieCache` -> fully stateless mode

### Cookie Cache Strategies

| Strategy | Description |
|----------|-------------|
| `compact` | Base64url + HMAC. Smallest. (default) |
| `jwt` | Standard JWT. Readable but signed. |
| `jwe` | Encrypted. Maximum security. |

### Key Options

```ts
session: {
  expiresIn: 60 * 60 * 24 * 7,  // 7 days (default)
  updateAge: 60 * 60 * 24,       // Refresh every 24h (default)
  freshAge: 60 * 60 * 24,        // Re-auth window for sensitive actions
  cookieCache: {
    enabled: true,
    maxAge: 300,                   // 5 minutes
    strategy: "compact",
  },
}
```

### Session Access

**Client:** `useSession()` hook returns `{ data: session, isPending }`

**Server:** `auth.api.getSession({ headers: await headers() })`

**Protected routes:** Check session, redirect to `/sign-in` if null.

---

## Authentication Methods

### Email & Password

```ts
emailAndPassword: {
  enabled: true,
  requireEmailVerification: true,
  minPasswordLength: 8,
  maxPasswordLength: 128,
  sendResetPassword: async ({ user, url }) => {
    await sendEmail({ to: user.email, subject: "Reset password", text: `Reset: ${url}` });
  },
  revokeSessionsOnPasswordReset: true,
}
```

### Email Verification

```ts
emailVerification: {
  sendVerificationEmail: async ({ user, url }) => {
    await sendEmail({ to: user.email, subject: "Verify email", text: `Verify: ${url}` });
  },
  sendOnSignUp: true,
}
```

### Social OAuth Sign-In

```ts
// Client-side
await signIn.social({ provider: "google", callbackURL: "https://app.example.com/dashboard" });
```

Always use **absolute URLs** for `callbackURL` to prevent origin inference issues.

---

## Plugins

**Import from dedicated paths for tree-shaking:**

```ts
import { twoFactor } from "better-auth/plugins/two-factor";
// NOT from "better-auth/plugins"
```

### Common Plugins

| Plugin | Server Import | Client Import | Purpose |
|--------|---------------|---------------|---------|
| `twoFactor` | `better-auth/plugins` | `twoFactorClient` | TOTP/OTP 2FA |
| `organization` | `better-auth/plugins` | `organizationClient` | Teams/orgs/RBAC |
| `admin` | `better-auth/plugins` | `adminClient` | User management |
| `bearer` | `better-auth/plugins` | - | API token auth |
| `passkey` | `@better-auth/passkey` | `passkeyClient` | WebAuthn |
| `sso` | `@better-auth/sso` | - | SAML/OIDC SSO |
| `magicLink` | `better-auth/plugins` | `magicLinkClient` | Passwordless email |
| `username` | `better-auth/plugins` | `usernameClient` | Username-based auth |

**Plugin pattern:** Add server plugin + client plugin + run migrations.

See `references/plugins-guide.md` for detailed 2FA and organization setup.

---

## Hooks

### Endpoint Hooks

```ts
hooks: {
  before: [
    { matcher: (ctx) => ctx.path === "/sign-up/email",
      handler: createAuthMiddleware(async (ctx) => {
        // Pre-process signup
      })
    }
  ],
  after: [
    { matcher: (ctx) => true,
      handler: createAuthMiddleware(async (ctx) => {
        // Post-process all requests
      })
    }
  ]
}
```

### Database Hooks

```ts
databaseHooks: {
  user: {
    create: {
      before: async (user) => { /* validate or transform */ return user; },
      after: async (user) => { /* post-creation logic */ },
    },
  },
  session: {
    create: { after: async (session) => { /* audit log */ } },
  },
}
```

---

## Security Essentials

### Production Checklist

- [ ] `BETTER_AUTH_SECRET` set (32+ chars, high entropy)
- [ ] `BETTER_AUTH_URL` uses HTTPS
- [ ] `trustedOrigins` configured for all frontend domains
- [ ] `advanced.useSecureCookies: true` in production
- [ ] Rate limiting enabled (auto in production)
- [ ] CSRF protection NOT disabled
- [ ] Email verification enabled for email/password
- [ ] Password reset flow implemented
- [ ] `account.accountLinking` reviewed

### Rate Limiting

```ts
rateLimit: {
  enabled: true,
  window: 10,     // seconds
  max: 100,       // requests per window
  storage: "secondary-storage",  // "memory" | "database" | "secondary-storage"
  customRules: {
    "/api/auth/sign-in/email": { window: 60, max: 5 },
  },
}
```

### Advanced Security

```ts
advanced: {
  useSecureCookies: true,
  cookiePrefix: "myapp",
  ipAddress: { ipAddressHeaders: ["x-forwarded-for"] },
  backgroundTasks: { handler: (promise) => waitUntil(promise) },
}
```

See `references/security-guide.md` for CSRF, OAuth security, session hardening, and audit logging.

---

## Type Safety

```ts
// Server-side type inference
export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;

// Cross-project type safety
import type { auth } from "../server/auth";
const client = createAuthClient<typeof auth>();
```

---

## Common Gotchas

1. **Model vs table name** — Config uses ORM model name, not DB table name.
2. **Plugin schema** — Re-run CLI `migrate`/`generate` after adding plugins.
3. **Secondary storage** — Sessions go there by default, not DB.
4. **Cookie cache** — Custom session fields NOT cached, always re-fetched from DB.
5. **Stateless mode** — No DB = session in cookie only, logout only on cache expiry.
6. **Change email flow** — Sends verification to current email first, then to new email.
7. **Callback URLs** — Always use absolute URLs with origin to avoid redirect issues.
8. **Plugin imports** — Import from dedicated paths (`better-auth/plugins/two-factor`) for tree-shaking.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| "Secret not set" | Add `BETTER_AUTH_SECRET` env var |
| "Invalid Origin" | Add domain to `trustedOrigins` |
| Cookies not setting | Check `baseURL` matches domain; enable secure cookies in prod |
| OAuth callback errors | Verify redirect URIs in provider dashboard |
| Type errors after plugin | Re-run CLI generate/migrate |
| Session null in Server Component | Add `nextCookies()` plugin to auth config |

---

## Resources

- [Docs](https://better-auth.com/docs)
- [Options Reference](https://better-auth.com/docs/reference/options)
- [Plugin List](https://better-auth.com/docs/concepts/plugins)
- [CLI](https://better-auth.com/docs/concepts/cli)
- [Examples](https://github.com/better-auth/examples)
- [GitHub](https://github.com/better-auth/better-auth)
