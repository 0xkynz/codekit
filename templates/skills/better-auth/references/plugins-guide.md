# Better Auth — Plugins Guide

Detailed configuration for Better Auth's major plugins: Two-Factor Authentication, Organizations, and Email/Password.

---

## Two-Factor Authentication (2FA)

### Server Setup

```ts
import { betterAuth } from "better-auth";
import { twoFactor } from "better-auth/plugins";

export const auth = betterAuth({
  appName: "My App",
  plugins: [
    twoFactor({
      issuer: "My App",  // Appears in authenticator apps
      totpOptions: { digits: 6, period: 30 },
      otpOptions: {
        sendOTP: async ({ user, otp }) => {
          await sendEmail({ to: user.email, subject: "Verification code", text: `Code: ${otp}` });
        },
        period: 5,             // Minutes
        allowedAttempts: 5,
        storeOTP: "encrypted", // "plain" | "encrypted" | "hashed"
      },
      backupCodeOptions: { amount: 10, length: 10, storeBackupCodes: "encrypted" },
      twoFactorCookieMaxAge: 600,          // 10 min temp cookie
      trustDeviceMaxAge: 30 * 24 * 60 * 60, // 30 days
    }),
  ],
});
```

Run `npx @better-auth/cli migrate` after adding.

### Client Setup

```ts
import { createAuthClient } from "better-auth/react";
import { twoFactorClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [
    twoFactorClient({
      onTwoFactorRedirect() {
        window.location.href = "/2fa";
      },
    }),
  ],
});
```

### Enabling 2FA for a User

```ts
const { data } = await authClient.twoFactor.enable({ password });
// data.totpURI — generate QR code from this
// data.backupCodes — show to user for safekeeping
```

`twoFactorEnabled` is NOT set to `true` until the user successfully verifies their first TOTP code. To skip: `skipVerificationOnEnable: true` (not recommended).

### Verifying TOTP

```ts
await authClient.twoFactor.verifyTotp({ code: "123456", trustDevice: true });
```

Accepts codes from one period before/after current time for clock skew tolerance.

### OTP (Email/SMS)

```ts
await authClient.twoFactor.sendOtp();  // Triggers sendOTP callback
await authClient.twoFactor.verifyOtp({ code: "123456", trustDevice: true });
```

### Backup Codes

```ts
// Regenerate (invalidates all previous)
const { data } = await authClient.twoFactor.generateBackupCodes({ password });

// Use for recovery
await authClient.twoFactor.verifyBackupCode({ code: "abc123def4" });
```

Each backup code is single-use and removed after verification.

### 2FA Sign-In Flow

1. User signs in with credentials
2. Response includes `twoFactorRedirect: true`
3. Session cookie is removed, temporary 2FA cookie is set (10 min)
4. User verifies via TOTP, OTP, or backup code
5. Session cookie created on successful verification

```ts
const { data } = await authClient.signIn.email({ email, password }, {
  onSuccess(ctx) {
    if (ctx.data.twoFactorRedirect) {
      window.location.href = "/2fa";
    }
  },
});
```

### Disabling 2FA

```ts
await authClient.twoFactor.disable({ password });
```

Revokes trusted device records.

### Security Notes

- TOTP secrets encrypted with auth secret (symmetric encryption)
- Built-in rate limiting: 3 requests per 10 seconds on all 2FA endpoints
- Constant-time comparison for OTP verification (timing attack prevention)
- 2FA only available for credential (email/password) accounts

---

## Organization Plugin

### Server Setup

```ts
import { betterAuth } from "better-auth";
import { organization } from "better-auth/plugins";

export const auth = betterAuth({
  plugins: [
    organization({
      allowUserToCreateOrganization: true,
      organizationLimit: 5,
      membershipLimit: 100,
      creatorRole: "owner",
      invitationExpiresIn: 60 * 60 * 48,  // 48 hours
      sendInvitationEmail: async (data) => {
        await sendEmail({
          to: data.email,
          subject: `Join ${data.organization.name}`,
          html: `<a href="https://app.com/invite/${data.invitation.id}">Accept</a>`,
        });
      },
    }),
  ],
});
```

Run `npx @better-auth/cli migrate` after adding.

### Client Setup

```ts
import { createAuthClient } from "better-auth/client";
import { organizationClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [organizationClient()],
});
```

### Creating Organizations

```ts
const { data } = await authClient.organization.create({
  name: "My Company",
  slug: "my-company",
  logo: "https://example.com/logo.png",
  metadata: { plan: "pro" },
});
```

Creator is automatically assigned the `owner` role.

### Dynamic Creation Control

```ts
organization({
  allowUserToCreateOrganization: async (user) => user.emailVerified === true,
  organizationLimit: async (user) => user.plan === "premium" ? 20 : 3,
});
```

### Active Organization

Stored in the session, scopes subsequent API calls:

```ts
await authClient.organization.setActive({ organizationId });

// These use active org automatically
await authClient.organization.listMembers();
await authClient.organization.listInvitations();
await authClient.organization.getFullOrganization();
```

### Members

```ts
// Add (server-side only)
await auth.api.addMember({ body: { userId, role: "member", organizationId } });

// Multiple roles
await auth.api.addMember({ body: { userId, role: ["admin", "moderator"], organizationId } });

// Update role
await authClient.organization.updateMemberRole({ memberId, role: "admin" });

// Remove
await authClient.organization.removeMember({ memberIdOrEmail: "user@example.com" });
```

**Important:** Last owner cannot be removed. Transfer ownership first.

### Invitations

```ts
// Send invitation
await authClient.organization.inviteMember({ email: "user@example.com", role: "member" });

// Get shareable URL (does NOT send email)
const { data } = await authClient.organization.getInvitationURL({
  email: "user@example.com", role: "member", callbackURL: "/dashboard",
});

// Accept
await authClient.organization.acceptInvitation({ invitationId });
```

### Default Roles & Permissions

| Role | Description |
|------|-------------|
| `owner` | Full access, can delete organization |
| `admin` | Manage members, invitations, settings |
| `member` | Basic access to organization resources |

```ts
// Check permission
const { data } = await authClient.organization.hasPermission({
  permission: "member:write",
});

// Client-side check (no API call)
const canManage = authClient.organization.checkRolePermission({
  role: "admin",
  permissions: ["member:write"],
});
```

### Teams

```ts
organization({
  teams: {
    enabled: true,
    maximumTeams: 20,
    maximumMembersPerTeam: 50,
  },
});

// Create team
await authClient.organization.createTeam({ name: "Engineering" });

// Manage members (must be org member first)
await authClient.organization.addTeamMember({ teamId, userId });
await authClient.organization.removeTeamMember({ teamId, userId });

// Set active team
await authClient.organization.setActiveTeam({ teamId });
```

### Dynamic Access Control

For custom roles per organization at runtime:

```ts
organization({ dynamicAccessControl: { enabled: true } });

// Create custom role
await authClient.organization.createRole({
  role: "moderator",
  permission: { member: ["read"], invitation: ["read"] },
});

// Update/delete
await authClient.organization.updateRole({ roleId, permission: { member: ["read", "write"] } });
await authClient.organization.deleteRole({ roleId });
```

Pre-defined roles (owner, admin, member) cannot be deleted.

### Lifecycle Hooks

```ts
organization({
  hooks: {
    organization: {
      beforeCreate: async ({ data, user }) => ({ data: { ...data, metadata: { createdBy: user.id } } }),
      afterCreate: async ({ organization }) => { /* create default resources */ },
      beforeDelete: async ({ organization }) => { /* archive data */ },
    },
    member: {
      afterCreate: async ({ member, organization }) => { /* notify admins */ },
    },
    invitation: {
      afterCreate: async ({ invitation }) => { /* log */ },
    },
  },
});
```

### Schema Customization

```ts
organization({
  schema: {
    organization: {
      modelName: "workspace",
      fields: { name: "workspaceName" },
      additionalFields: {
        billingId: { type: "string", required: false },
      },
    },
    member: {
      additionalFields: {
        department: { type: "string", required: false },
      },
    },
  },
});
```

### Organization Security

- Last owner cannot be removed, leave, or have owner role stripped
- Deletion removes all members, invitations, teams
- Disable deletion: `disableOrganizationDeletion: true`
- Invitations expire after 48 hours by default
- Only the invited email can accept an invitation

---

## Email & Password — Advanced

### Password Hashing

Default: `scrypt` (OWASP-recommended, native Node.js support).

Custom algorithm (e.g., Argon2id):

```ts
import { hash, verify } from "@node-rs/argon2";

emailAndPassword: {
  enabled: true,
  password: {
    hash: (password) => hash(password, { memoryCost: 65536, timeCost: 3, parallelism: 4 }),
    verify: ({ password, hash: stored }) => verify(stored, password),
  },
}
```

**Warning:** Switching algorithms breaks existing user sign-in. Plan a migration.

### Password Reset Security

Better Auth implements:
- **Timing attack prevention** — Background email sending, dummy operations on invalid users
- **Constant response** — Always returns "If this email exists..." regardless of existence
- **Cryptographic tokens** — 24-char alphanumeric, expires in 1 hour (configurable)
- **Single-use** — Token deleted after successful reset
- **Redirect validation** — `redirectTo` validated against `trustedOrigins`

```ts
// Send reset email
await authClient.requestPasswordReset({
  email: "user@example.com",
  redirectTo: "https://app.example.com/reset-password",
});
```

### Serverless Background Tasks

On serverless platforms, configure background task handler for timing attack prevention:

```ts
advanced: {
  backgroundTasks: {
    handler: (promise) => waitUntil(promise),  // Platform-specific
  },
}
```

### Client-Side Validation

Better Auth validates server-side, but add client-side validation for:
1. Immediate UX feedback
2. Reduced server load from invalid requests
