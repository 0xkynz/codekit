# Better Auth — Security Guide

Comprehensive security configuration for Better Auth: secret management, rate limiting, CSRF, sessions, cookies, OAuth, IP tracking, and audit logging.

---

## Secret Management

The auth secret is used for signing session tokens, encrypting data, and generating cookies.

### Resolution Order

1. `options.secret` in config
2. `BETTER_AUTH_SECRET` environment variable
3. `AUTH_SECRET` environment variable

### Requirements

Better Auth validates secrets and will:
- **Reject** default/placeholder secrets in production
- **Warn** if shorter than 32 characters
- **Warn** if entropy below 120 bits

```bash
# Generate secure secret
openssl rand -base64 32
```

Never commit secrets to version control.

---

## Rate Limiting

Enabled by default in production, disabled in development.

### Configuration

```ts
rateLimit: {
  enabled: true,
  window: 10,    // seconds
  max: 100,      // requests per window
  storage: "secondary-storage",  // "memory" | "database" | "secondary-storage"
}
```

### Storage Options

| Storage | Behavior |
|---------|----------|
| `memory` | Fast, resets on restart. Not recommended for serverless. |
| `database` | Persistent, adds DB load. |
| `secondary-storage` | Uses Redis/KV. Default when available. |

### Custom Storage

```ts
rateLimit: {
  customStorage: {
    get: async (key) => { /* return { count, expiresAt } or null */ },
    set: async (key, data) => { /* store rate limit data */ },
  },
}
```

### Default Endpoint Limits

Sensitive endpoints have stricter limits (3 requests per 10 seconds):
- `/sign-in`, `/sign-up`, `/change-password`, `/change-email`

### Custom Rules

```ts
rateLimit: {
  customRules: {
    "/api/auth/sign-in/email": { window: 60, max: 5 },
    "/api/auth/some-safe-endpoint": false,  // Disable
  },
}
```

---

## CSRF Protection

Multiple layers enabled by default.

### How It Works

1. **Origin header validation** — When cookies present, `Origin`/`Referer` must match trusted origin
2. **Fetch Metadata** — Uses `Sec-Fetch-Site`, `Sec-Fetch-Mode`, `Sec-Fetch-Dest` to detect cross-site requests
3. **First-login protection** — Validates origin even without cookies when Fetch Metadata indicates cross-site navigation

### Configuration

```ts
advanced: {
  disableCSRFCheck: false,    // Keep enabled (default)
  disableOriginCheck: false,  // Keep enabled (default)
}
```

**Warning:** Only disable for testing or if you have an alternative CSRF mechanism.

### Fetch Metadata Blocking

Automatically blocks requests where:
- `Sec-Fetch-Site: cross-site` AND
- `Sec-Fetch-Mode: navigate` AND
- `Sec-Fetch-Dest: document`

Prevents form-based CSRF even on first login.

---

## Trusted Origins

Controls which domains can make authenticated requests.

### Configuration

```ts
trustedOrigins: [
  "https://app.example.com",
  "https://admin.example.com",
]
```

The `baseURL` origin is automatically trusted.

### Environment Variable

```bash
BETTER_AUTH_TRUSTED_ORIGINS=https://app.example.com,https://admin.example.com
```

### Wildcard Patterns

```ts
trustedOrigins: [
  "*.example.com",                // Any subdomain
  "https://*.example.com",       // Protocol-specific
  "exp://192.168.*.*:*/*",       // Custom schemes (Expo)
]
```

### Dynamic Origins

```ts
trustedOrigins: async (request) => {
  const tenant = getTenantFromRequest(request);
  return [`https://${tenant}.myapp.com`];
}
```

### Validated Parameters

Better Auth validates these URL parameters against trusted origins:
- `callbackURL`, `redirectTo`, `errorCallbackURL`, `newUserCallbackURL`, `origin`

Invalid URLs receive 403 Forbidden.

---

## Session Security

### Expiration

```ts
session: {
  expiresIn: 60 * 60 * 24 * 7,  // 7 days (default)
  updateAge: 60 * 60 * 24,       // Refresh every 24h (default)
  freshAge: 60 * 60 * 24,        // 24h (re-auth window for sensitive actions)
}
```

### Cookie Cache

Reduces database queries by caching session data in cookies:

```ts
session: {
  cookieCache: {
    enabled: true,
    maxAge: 300,          // 5 minutes
    strategy: "compact",  // "compact" | "jwt" | "jwe"
  },
}
```

| Strategy | Description |
|----------|-------------|
| `compact` | Base64url + HMAC-SHA256. Smallest, signed. |
| `jwt` | HS256 JWT. Standard, signed. |
| `jwe` | A256CBC-HS512. Encrypted, largest. |

Use `jwe` when session data contains sensitive information.

**Note:** Custom session fields are NOT cached — always re-fetched from DB.

---

## Cookie Security

### Defaults

- `secure`: `true` when baseURL uses HTTPS or in production
- `sameSite`: `"lax"` (CSRF prevention + normal navigation)
- `httpOnly`: `true` (no JS access)
- `path`: `"/"` (site-wide)
- Prefix: `__Secure-` when secure enabled

### Custom Configuration

```ts
advanced: {
  useSecureCookies: true,
  cookiePrefix: "myapp",
  defaultCookieAttributes: {
    sameSite: "strict",
    path: "/auth",
  },
}
```

### Per-Cookie Config

```ts
advanced: {
  cookies: {
    session_token: {
      name: "auth-session",
      attributes: { sameSite: "strict" },
    },
  },
}
```

### Cross-Subdomain Cookies

```ts
advanced: {
  crossSubDomainCookies: {
    enabled: true,
    domain: ".example.com",  // Leading dot
    additionalCookies: ["session_token", "session_data"],
  },
}
```

**Security note:** Expands attack surface. Only enable if you trust all subdomains.

---

## OAuth / Social Provider Security

### PKCE (Proof Key for Code Exchange)

Automatically enabled for all OAuth flows:
1. Generates 128-char random `code_verifier`
2. Creates `code_challenge` using SHA-256
3. Validates code exchange with original verifier

Prevents authorization code interception.

### State Parameter

```ts
account: {
  storeStateStrategy: "cookie",  // "cookie" (default) | "database"
}
```

State tokens: 32-char random, expire after 10 minutes, contain callback URLs + PKCE verifier (encrypted).

### Encrypt OAuth Tokens

```ts
account: {
  encryptOAuthTokens: true,  // AES-256-GCM
}
```

Enable when storing tokens for API access on behalf of users.

### Skip State Cookie (Mobile)

```ts
account: {
  skipStateCookieCheck: true,  // Only for mobile apps
}
```

Only for mobile apps that cannot maintain cookies across redirects.

---

## IP-Based Security

### Configuration

```ts
advanced: {
  ipAddress: {
    ipAddressHeaders: ["x-forwarded-for", "x-real-ip"],
    disableIpTracking: false,
    ipv6Subnet: 64,  // 128 | 64 | 48 | 32
  },
}
```

Smaller subnet values group more IPv6 addresses for rate limiting.

### Trusted Proxy Headers

```ts
advanced: {
  trustedProxyHeaders: true,  // Trust x-forwarded-host, x-forwarded-proto
}
```

Only enable if you trust your proxy — clients could spoof these headers otherwise.

---

## Database Hooks for Audit Logging

```ts
databaseHooks: {
  session: {
    create: {
      after: async ({ data, ctx }) => {
        await auditLog("session.created", {
          userId: data.userId,
          ip: ctx?.request?.headers.get("x-forwarded-for"),
          userAgent: ctx?.request?.headers.get("user-agent"),
        });
      },
    },
    delete: {
      before: async ({ data }) => {
        await auditLog("session.revoked", { sessionId: data.id });
      },
    },
  },
  user: {
    update: {
      after: async ({ data, oldData }) => {
        if (oldData?.email !== data.email) {
          await auditLog("user.email_changed", { userId: data.id });
        }
      },
    },
    delete: {
      before: async ({ data }) => {
        if (protectedUserIds.includes(data.id)) return false;  // Block deletion
      },
    },
  },
  account: {
    create: {
      after: async ({ data }) => {
        await auditLog("account.linked", { userId: data.userId, provider: data.providerId });
      },
    },
  },
}
```

Return `false` from a `before` hook to prevent the operation.

---

## Background Tasks (Timing Attack Prevention)

Sensitive operations should complete in constant time:

```ts
advanced: {
  backgroundTasks: {
    handler: (promise) => {
      // Platform-specific:
      // Vercel: waitUntil(promise)
      // Cloudflare: ctx.waitUntil(promise)
      waitUntil(promise);
    },
  },
}
```

Ensures email sending doesn't affect response timing (prevents account enumeration).

---

## Account Enumeration Prevention

Built-in protections:
1. **Consistent responses** — Password reset always returns "If this email exists..."
2. **Dummy operations** — Token generation + DB lookup even when user not found
3. **Background email** — Async sending prevents timing differences

**Recommendation:** Use generic error messages ("Invalid credentials") instead of specific ("User not found" / "Incorrect password").

---

## Production Security Checklist

- [ ] Strong secret (32+ chars, high entropy, from env var)
- [ ] `baseURL` uses HTTPS
- [ ] All frontend origins in `trustedOrigins`
- [ ] Rate limiting enabled with appropriate limits
- [ ] CSRF protection enabled (default)
- [ ] Secure cookies enabled (automatic with HTTPS)
- [ ] OAuth tokens encrypted if stored (`encryptOAuthTokens: true`)
- [ ] Background tasks configured for serverless platforms
- [ ] Audit logging via `databaseHooks`
- [ ] IP tracking headers configured for proxy setups
- [ ] Email verification enabled for email/password
- [ ] Password reset with session revocation
- [ ] 2FA enabled for sensitive applications
