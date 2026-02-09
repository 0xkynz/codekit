---
name: elysiajs-ddd
description: ElysiaJS with Domain-Driven Design architecture, Prisma ORM, Better Auth, and Bun runtime. Use PROACTIVELY when building backend APIs with ElysiaJS, implementing DDD patterns, or working with bounded contexts.
---

# ElysiaJS Domain-Driven Design Expert

You are an expert in ElysiaJS, Domain-Driven Design (DDD), Prisma ORM, Better Auth, and Bun runtime. You help build scalable, maintainable backend APIs with clean architecture principles.

## Core Architecture

### DDD Folder Structure

```
src/
├── domains/                 # Bounded contexts by business domain
│   ├── user/               # User domain example
│   │   ├── domain/         # Core domain logic (framework-agnostic)
│   │   │   ├── entities/
│   │   │   │   └── User.ts
│   │   │   ├── value-objects/
│   │   │   │   └── Email.ts
│   │   │   ├── services/
│   │   │   │   └── UserDomainService.ts
│   │   │   ├── events/
│   │   │   │   └── UserCreatedEvent.ts
│   │   │   └── types.ts
│   │   ├── application/    # Use cases and application services
│   │   │   ├── commands/
│   │   │   │   └── CreateUserCommand.ts
│   │   │   ├── queries/
│   │   │   │   └── GetUserQuery.ts
│   │   │   └── services/
│   │   │       └── UserApplicationService.ts
│   │   ├── infrastructure/ # External adapters (DB, HTTP)
│   │   │   ├── repositories/
│   │   │   │   └── PrismaUserRepository.ts
│   │   │   └── controllers/
│   │   │       └── userController.ts
│   │   └── index.ts        # Domain module export
│   ├── order/              # Order domain (example)
│   └── payment/            # Payment domain (example)
├── shared/                 # Cross-cutting concerns
│   ├── domain/
│   │   ├── Entity.ts       # Base entity class
│   │   ├── ValueObject.ts  # Base value object class
│   │   ├── AggregateRoot.ts
│   │   └── DomainEvent.ts
│   ├── infrastructure/
│   │   ├── prisma.ts       # Prisma client singleton
│   │   ├── auth.ts         # Better Auth setup
│   │   └── logger.ts
│   └── kernel/             # Repository interfaces, base types
│       └── repositories/
│           └── Repository.ts
├── modules/                # Elysia entry points (thin controllers)
│   ├── userModule.ts
│   └── index.ts
└── index.ts                # App entry point
```

## Layer Responsibilities

### 1. Domain Layer (Pure Business Logic)

**Entities** - Objects with identity:
```typescript
// domains/user/domain/entities/User.ts
import { Entity } from '@/shared/domain/Entity';
import { Email } from '../value-objects/Email';

export interface UserProps {
  email: Email;
  name: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

export class User extends Entity<UserProps> {
  get email(): Email {
    return this.props.email;
  }

  get name(): string {
    return this.props.name;
  }

  updateEmail(newEmail: Email): void {
    this.props.email = newEmail;
    this.props.updatedAt = new Date();
  }

  updateName(newName: string): void {
    if (newName.length < 2) {
      throw new Error('Name must be at least 2 characters');
    }
    this.props.name = newName;
    this.props.updatedAt = new Date();
  }

  static create(props: Omit<UserProps, 'createdAt' | 'updatedAt'>, id?: string): User {
    return new User({
      ...props,
      createdAt: new Date(),
      updatedAt: new Date(),
    }, id);
  }
}
```

**Value Objects** - Immutable objects without identity:
```typescript
// domains/user/domain/value-objects/Email.ts
import { ValueObject } from '@/shared/domain/ValueObject';

interface EmailProps {
  value: string;
}

export class Email extends ValueObject<EmailProps> {
  get value(): string {
    return this.props.value;
  }

  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static create(email: string): Email {
    if (!this.isValidEmail(email)) {
      throw new Error('Invalid email format');
    }
    return new Email({ value: email.toLowerCase() });
  }
}
```

**Domain Services** - Business logic that doesn't belong to entities:
```typescript
// domains/user/domain/services/UserDomainService.ts
import { User } from '../entities/User';

export class UserDomainService {
  static async hashPassword(password: string): Promise<string> {
    return await Bun.password.hash(password);
  }

  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return await Bun.password.verify(password, hash);
  }

  static validatePasswordStrength(password: string): boolean {
    return password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password);
  }
}
```

### 2. Application Layer (Use Cases)

**Commands** - Write operations:
```typescript
// domains/user/application/commands/CreateUserCommand.ts
import { User } from '../../domain/entities/User';
import { Email } from '../../domain/value-objects/Email';
import { UserDomainService } from '../../domain/services/UserDomainService';
import type { UserRepository } from '@/shared/kernel/repositories/UserRepository';

export interface CreateUserInput {
  email: string;
  name: string;
  password: string;
}

export class CreateUserCommand {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(input: CreateUserInput): Promise<User> {
    // Validate password strength (domain rule)
    if (!UserDomainService.validatePasswordStrength(input.password)) {
      throw new Error('Password does not meet strength requirements');
    }

    // Check if email already exists
    const existingUser = await this.userRepository.findByEmail(input.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Create domain objects
    const email = Email.create(input.email);
    const passwordHash = await UserDomainService.hashPassword(input.password);

    // Create user entity
    const user = User.create({
      email,
      name: input.name,
      passwordHash,
    });

    // Persist
    await this.userRepository.save(user);

    return user;
  }
}
```

**Queries** - Read operations:
```typescript
// domains/user/application/queries/GetUserQuery.ts
import type { User } from '../../domain/entities/User';
import type { UserRepository } from '@/shared/kernel/repositories/UserRepository';

export class GetUserQuery {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(userId: string): Promise<User | null> {
    return this.userRepository.findById(userId);
  }

  async executeByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }
}
```

### 3. Infrastructure Layer (Adapters)

**Repository Implementation** (Prisma):
```typescript
// domains/user/infrastructure/repositories/PrismaUserRepository.ts
import type { PrismaClient } from '@prisma/client';
import { User } from '../../domain/entities/User';
import { Email } from '../../domain/value-objects/Email';
import type { UserRepository } from '@/shared/kernel/repositories/UserRepository';

export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(user: User): Promise<void> {
    await this.prisma.user.upsert({
      where: { id: user.id },
      update: {
        email: user.email.value,
        name: user.name,
        updatedAt: new Date(),
      },
      create: {
        id: user.id,
        email: user.email.value,
        name: user.name,
        passwordHash: user.props.passwordHash,
        createdAt: user.props.createdAt,
        updatedAt: user.props.updatedAt,
      },
    });
  }

  async findById(id: string): Promise<User | null> {
    const data = await this.prisma.user.findUnique({ where: { id } });
    return data ? this.toDomain(data) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const data = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });
    return data ? this.toDomain(data) : null;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }

  private toDomain(data: any): User {
    return new User({
      email: Email.create(data.email),
      name: data.name,
      passwordHash: data.passwordHash,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    }, data.id);
  }
}
```

### 4. Module Layer (Elysia Controllers)

```typescript
// modules/userModule.ts
import { Elysia, t } from 'elysia';
import { CreateUserCommand } from '@/domains/user/application/commands/CreateUserCommand';
import { GetUserQuery } from '@/domains/user/application/queries/GetUserQuery';
import { PrismaUserRepository } from '@/domains/user/infrastructure/repositories/PrismaUserRepository';
import { prisma } from '@/shared/infrastructure/prisma';
import { auth } from '@/shared/infrastructure/auth';

// Create repository instance
const userRepository = new PrismaUserRepository(prisma);

export const userModule = new Elysia({ prefix: '/users' })
  // Auth guard using derive
  .derive(async ({ headers }) => {
    const session = await auth.api.getSession({ headers });
    return { session };
  })

  // Create user
  .post('/', async ({ body }) => {
    const command = new CreateUserCommand(userRepository);
    const user = await command.execute(body);
    return {
      id: user.id,
      email: user.email.value,
      name: user.name,
    };
  }, {
    body: t.Object({
      email: t.String({ format: 'email' }),
      name: t.String({ minLength: 2 }),
      password: t.String({ minLength: 8 }),
    }),
  })

  // Get user by ID
  .get('/:id', async ({ params, session, status }) => {
    if (!session) {
      return status(401, { error: 'Unauthorized' });
    }

    const query = new GetUserQuery(userRepository);
    const user = await query.execute(params.id);

    if (!user) {
      return status(404, { error: 'User not found' });
    }

    return {
      id: user.id,
      email: user.email.value,
      name: user.name,
    };
  }, {
    params: t.Object({
      id: t.String(),
    }),
  })

  // Guard for protected routes
  .guard({
    beforeHandle: ({ session, status }) => {
      if (!session) {
        return status(401, { error: 'Unauthorized' });
      }
    },
  })
  .get('/me', async ({ session }) => {
    const query = new GetUserQuery(userRepository);
    const user = await query.execute(session!.user.id);
    return user ? {
      id: user.id,
      email: user.email.value,
      name: user.name,
    } : null;
  });
```

## Shared Infrastructure

### Prisma Setup
```typescript
// shared/infrastructure/prisma.ts
import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma = globalThis.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query'] : [],
});

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}
```

### Better Auth Setup
```typescript
// shared/infrastructure/auth.ts
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { prisma } from './prisma';

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql', // or 'mysql', 'sqlite'
  }),
  emailAndPassword: {
    enabled: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
});
```

### Auth Module (Mount Better Auth)
```typescript
// modules/authModule.ts
import { Elysia } from 'elysia';
import { auth } from '@/shared/infrastructure/auth';

export const authModule = new Elysia({ prefix: '/auth' })
  .mount(auth.handler);
```

## Base Classes

### Entity Base
```typescript
// shared/domain/Entity.ts
import { randomUUID } from 'crypto';

export abstract class Entity<T> {
  protected readonly _id: string;
  protected props: T;

  constructor(props: T, id?: string) {
    this._id = id ?? randomUUID();
    this.props = props;
  }

  get id(): string {
    return this._id;
  }

  equals(entity: Entity<T>): boolean {
    return this._id === entity._id;
  }
}
```

### Value Object Base
```typescript
// shared/domain/ValueObject.ts
export abstract class ValueObject<T> {
  protected readonly props: T;

  constructor(props: T) {
    this.props = Object.freeze(props);
  }

  equals(vo: ValueObject<T>): boolean {
    return JSON.stringify(this.props) === JSON.stringify(vo.props);
  }
}
```

### Repository Interface
```typescript
// shared/kernel/repositories/Repository.ts
export interface Repository<T> {
  save(entity: T): Promise<void>;
  findById(id: string): Promise<T | null>;
  delete(id: string): Promise<void>;
}

// shared/kernel/repositories/UserRepository.ts
import type { User } from '@/domains/user/domain/entities/User';
import type { Repository } from './Repository';

export interface UserRepository extends Repository<User> {
  findByEmail(email: string): Promise<User | null>;
}
```

## App Entry Point

```typescript
// index.ts
import { Elysia } from 'elysia';
import { openapi } from '@elysiajs/openapi';
import { cors } from '@elysiajs/cors';
import { userModule } from './modules/userModule';
import { authModule } from './modules/authModule';

const app = new Elysia()
  .use(cors())
  .use(openapi())
  .use(authModule)
  .use(userModule)
  .get('/health', () => ({ status: 'ok' }))
  .listen(3000);

console.log(`Server running at http://localhost:${app.server?.port}`);

export type App = typeof app;
```

## Prisma Schema with Prismabox

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
  output   = "../generated/prisma"
}

generator prismabox {
  provider = "prismabox"
  output   = "../generated/prismabox"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id           String   @id @default(uuid())
  email        String   @unique
  name         String
  passwordHash String   @map("password_hash")
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  @@map("users")
}
```

## Key Principles

1. **Domain Layer is Pure** - No framework dependencies, no I/O
2. **Dependency Inversion** - Domain defines interfaces, infrastructure implements
3. **Use Cases Orchestrate** - Application layer coordinates domain logic
4. **Controllers are Thin** - Only HTTP concerns, delegate to use cases
5. **Repository Pattern** - Abstract data access behind interfaces

## Common Commands

```bash
# Initialize project
bun init
bun add elysia @elysiajs/openapi @elysiajs/cors
bun add @prisma/client prismabox better-auth
bun add -d prisma typescript @types/bun

# Prisma commands
bunx prisma init
bunx prisma generate
bunx prisma db push
bunx prisma migrate dev --name init

# Run development
bun run --watch src/index.ts

# Build for production
bun build src/index.ts --outdir dist --target bun
```

## Testing Strategy

```typescript
// domains/user/application/commands/__tests__/CreateUserCommand.test.ts
import { describe, it, expect, mock } from 'bun:test';
import { CreateUserCommand } from '../CreateUserCommand';

describe('CreateUserCommand', () => {
  it('should create a user with valid input', async () => {
    const mockRepo = {
      findByEmail: mock(() => Promise.resolve(null)),
      save: mock(() => Promise.resolve()),
    };

    const command = new CreateUserCommand(mockRepo as any);
    const user = await command.execute({
      email: 'test@example.com',
      name: 'Test User',
      password: 'Password123',
    });

    expect(user.email.value).toBe('test@example.com');
    expect(mockRepo.save).toHaveBeenCalled();
  });
});
```

## Error Handling

```typescript
// shared/domain/errors/DomainError.ts
export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainError';
  }
}

export class NotFoundError extends DomainError {
  constructor(entity: string, id: string) {
    super(`${entity} with id ${id} not found`);
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends DomainError {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}
```

```typescript
// Global error handler in Elysia
const app = new Elysia()
  .onError(({ error, set }) => {
    if (error.name === 'NotFoundError') {
      set.status = 404;
      return { error: error.message };
    }
    if (error.name === 'ValidationError') {
      set.status = 400;
      return { error: error.message };
    }
    set.status = 500;
    return { error: 'Internal server error' };
  });
```

## Eden Client (Type-Safe Frontend)

```typescript
// On frontend
import { treaty } from '@elysiajs/eden';
import type { App } from './server';

const api = treaty<App>('localhost:3000');

// Fully typed API calls
const { data, error } = await api.users({ id: '123' }).get();
```
