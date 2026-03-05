# Patterns Catalog — Detailed Implementations

## SQL Repository Base

Abstract class implementing `RepositoryPort`. Handles validation, event publishing, transactions, and error mapping.

```typescript
export abstract class SqlRepositoryBase<
  Aggregate extends AggregateRoot<any>,
  DbModel extends ObjectLiteral,
> implements RepositoryPort<Aggregate> {
  protected abstract tableName: string;
  protected abstract schema: ZodObject<any>;

  constructor(
    private readonly _pool: DatabasePool,
    protected readonly mapper: Mapper<Aggregate, DbModel>,
    protected readonly eventEmitter: EventEmitter2,
    protected readonly logger: LoggerPort,
  ) {}

  async insert(entity: Aggregate | Aggregate[]): Promise<void> {
    const entities = Array.isArray(entity) ? entity : [entity];
    const records = entities.map((e) => this.mapper.toPersistence(e));
    const query = sql`INSERT INTO ${sql.identifier([this.tableName])} ...`;
    await this.writeQuery(query, entities);
  }

  /** Validates entities, executes query, then publishes domain events. */
  protected async writeQuery(query: QuerySqlToken, entities: Aggregate[]): Promise<QueryResult<any>> {
    entities.forEach((entity) => entity.validate());
    const result = await this.pool.query(query);
    await Promise.all(
      entities.map((entity) => entity.publishEvents(this.logger, this.eventEmitter)),
    );
    return result;
  }

  /** Transaction shares connection via request context so event handlers participate. */
  public async transaction<T>(handler: () => Promise<T>): Promise<T> {
    return this.pool.transaction(async (connection) => {
      RequestContextService.setTransactionConnection(connection);
      try {
        return await handler();
      } finally {
        RequestContextService.cleanTransactionConnection();
      }
    });
  }

  /** Uses transaction connection if inside a transaction, otherwise pool. */
  protected get pool(): DatabasePool | DatabaseTransactionConnection {
    return RequestContextService.getContext().transactionConnection ?? this._pool;
  }
}
```

Key behaviors:
1. `validate()` called on every entity before persistence
2. Domain events published after every write
3. Transaction connection shared via request context — event handlers run in same transaction
4. Catches `UniqueIntegrityConstraintViolationError` → domain `ConflictException`

## Concrete Mapper (User Example)

Shows how Value Objects are flattened for persistence and reconstructed for domain:

```typescript
export class UserMapper implements Mapper<UserEntity, UserModel, UserResponseDto> {
  toPersistence(entity: UserEntity): UserModel {
    const copy = entity.getProps();
    const record: UserModel = {
      id: copy.id,
      email: copy.email,
      country: copy.address.country,         // Address VO → flat columns
      postalCode: copy.address.postalCode,
      street: copy.address.street,
      role: copy.role,
      createdAt: copy.createdAt,
      updatedAt: copy.updatedAt,
    };
    return userSchema.parse(record);         // validate with Zod before save
  }

  toDomain(record: UserModel): UserEntity {
    return new UserEntity({
      id: record.id,
      createdAt: new Date(record.createdAt),
      updatedAt: new Date(record.updatedAt),
      props: {
        email: record.email,
        role: record.role,
        address: new Address({               // flat columns → Address VO
          street: record.street,
          postalCode: record.postalCode,
          country: record.country,
        }),
      },
    });
  }

  toResponse(entity: UserEntity): UserResponseDto {
    const props = entity.getProps();
    const response = new UserResponseDto(entity);
    response.email = props.email;            // whitelist: only expose what's needed
    response.country = props.address.country;
    response.postalCode = props.address.postalCode;
    response.street = props.address.street;
    // props.role intentionally NOT mapped — never exposed via API
    return response;
  }
}
```

## Persistence Model (Zod Schema)

Runtime validation of database records separate from domain model:

```typescript
export const userSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.preprocess((val: any) => new Date(val), z.date()),
  updatedAt: z.preprocess((val: any) => new Date(val), z.date()),
  email: z.string().email(),
  country: z.string().min(1).max(255),
  postalCode: z.string().min(1).max(20),
  street: z.string().min(1).max(255),
  role: z.nativeEnum(UserRoles),
});

export type UserModel = z.TypeOf<typeof userSchema>;
```

## Exception Hierarchy

Base exception with correlation ID and string error codes:

```typescript
export interface SerializedException {
  message: string;
  code: string;
  correlationId: string;
  stack?: string;
  cause?: string;
  metadata?: unknown;
}

export abstract class ExceptionBase extends Error {
  abstract code: string;
  public readonly correlationId: string;

  constructor(
    readonly message: string,
    readonly cause?: Error,
    readonly metadata?: unknown,
  ) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
    this.correlationId = RequestContextService.getRequestId();
  }

  toJSON(): SerializedException {
    return {
      message: this.message,
      code: this.code,
      correlationId: this.correlationId,
      stack: this.stack,
      cause: this.cause?.message,
      metadata: this.metadata,
    };
  }
}
```

Generic exception codes (string-based, not HTTP):

```typescript
export const ARGUMENT_INVALID = 'GENERIC.ARGUMENT_INVALID';
export const ARGUMENT_OUT_OF_RANGE = 'GENERIC.ARGUMENT_OUT_OF_RANGE';
export const ARGUMENT_NOT_PROVIDED = 'GENERIC.ARGUMENT_NOT_PROVIDED';
export const NOT_FOUND = 'GENERIC.NOT_FOUND';
export const CONFLICT = 'GENERIC.CONFLICT';
export const INTERNAL_SERVER_ERROR = 'GENERIC.INTERNAL_SERVER_ERROR';

// Concrete generic exceptions
export class ArgumentInvalidException extends ExceptionBase { readonly code = ARGUMENT_INVALID; }
export class ArgumentOutOfRangeException extends ExceptionBase { readonly code = ARGUMENT_OUT_OF_RANGE; }
export class ArgumentNotProvidedException extends ExceptionBase { readonly code = ARGUMENT_NOT_PROVIDED; }
export class ConflictException extends ExceptionBase { readonly code = CONFLICT; }
export class NotFoundException extends ExceptionBase { readonly code = NOT_FOUND; }
```

Domain-specific errors:

```typescript
export class UserAlreadyExistsError extends ExceptionBase {
  static readonly message = 'User already exists';
  public readonly code = 'USER.ALREADY_EXISTS';
  constructor(cause?: Error, metadata?: unknown) {
    super(UserAlreadyExistsError.message, cause, metadata);
  }
}
```

## Request Context

Per-request context that carries correlation ID and shared transaction connection:

```typescript
export class AppRequestContext extends RequestContext {
  requestId: string;
  transactionConnection?: DatabaseTransactionConnection;
}

export class RequestContextService {
  static getContext(): AppRequestContext { return RequestContext.currentContext.req as AppRequestContext; }
  static setRequestId(id: string): void { this.getContext().requestId = id; }
  static getRequestId(): string { return this.getContext().requestId; }
  static getTransactionConnection(): DatabaseTransactionConnection | undefined { return this.getContext().transactionConnection; }
  static setTransactionConnection(connection: DatabaseTransactionConnection): void { this.getContext().transactionConnection = connection; }
  static cleanTransactionConnection(): void { this.getContext().transactionConnection = undefined; }
}
```

The correlation ID flows through: command metadata → domain event metadata → exception correlationId → all log messages. This enables full request tracing.

## Domain Entity Example (User)

```typescript
export class UserEntity extends AggregateRoot<UserProps> {
  protected readonly _id: AggregateID;

  static create(create: CreateUserProps): UserEntity {
    const id = randomUUID();
    const props: UserProps = { ...create, role: UserRoles.guest };
    const user = new UserEntity({ id, props });
    user.addEvent(new UserCreatedDomainEvent({
      aggregateId: id,
      email: props.email,
      ...props.address.unpack(),
    }));
    return user;
  }

  get role(): UserRoles { return this.props.role; }

  makeAdmin(): void { this.changeRole(UserRoles.admin); }
  makeModerator(): void { this.changeRole(UserRoles.moderator); }

  private changeRole(newRole: UserRoles): void {
    this.addEvent(new UserRoleChangedDomainEvent({
      aggregateId: this.id,
      oldRole: this.props.role,
      newRole,
    }));
    this.props.role = newRole;
  }

  delete(): void {
    this.addEvent(new UserDeletedDomainEvent({ aggregateId: this.id }));
  }

  updateAddress(props: UpdateUserAddressProps): void {
    const newAddress = new Address({ ...this.props.address, ...props } as AddressProps);
    this.props.address = newAddress;
    this.addEvent(new UserAddressUpdatedDomainEvent({ aggregateId: this.id, ...newAddress }));
  }

  validate(): void { /* enforce domain invariants before persistence */ }
}
```

Key patterns:
- No public setters — state changes only through named methods
- Every state change publishes a domain event
- Factory method `create()` centralizes creation logic
- `validate()` called automatically by repository before save

## Architecture Linting (dependency-cruiser)

Enforce layer boundaries as lint rules:

```javascript
// .dependency-cruiser.js
module.exports = {
  forbidden: [
    {
      name: 'no-domain-to-api-deps',
      severity: 'error',
      from: { path: ['domain', 'entity', 'aggregate', 'value-object'] },
      to: { path: ['controller', 'dtos', 'request', 'response'] },
    },
    {
      name: 'no-domain-to-infra-deps',
      severity: 'error',
      from: { path: domainLayerPaths },
      to: { path: infrastructureLayerPaths, pathNot: ['port\\.ts$'] },
    },
    {
      name: 'no-command-query-to-api-deps',
      severity: 'error',
      from: { path: ['query-handler', 'command-handler', 'service\\.ts$'] },
      to: { path: apiLayerPaths },
    },
  ],
};
```

## BDD Testing with Gherkin

```gherkin
Feature: Create a user

  Scenario: I can create a user
    Given user profile data
      | email              | country | street      | postalCode |
      | john.doe@gmail.com | England | Road Avenue | 29145      |
    When I send a request to create a user
    Then I receive my user ID
    And I can see my user in a list of all users
```

```typescript
defineFeature(feature, (test) => {
  test('I can create a user', ({ given, when, then, and }) => {
    const ctx = new TestContext<CreateUserTestContext>();
    givenUserProfileData(given, ctx);
    iSendARequestToCreateAUser(when, ctx);
    then('I receive my user ID', () => {
      expect(typeof ctx.latestResponse.id).toBe('string');
    });
    and('I can see my user in a list of all users', async () => {
      const res = await apiClient.findAllUsers();
      expect(res.data.some(item => item.id === ctx.latestResponse.id)).toBe(true);
    });
  });
});
```

Pattern: shared steps factored out, `TestContext` carries state, real DB (not mocks).

## DI Wiring Pattern

```typescript
// Tokens
export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

// Module
@Module({
  imports: [CqrsModule],
  controllers: [...httpControllers, ...messageControllers],
  providers: [
    ...commandHandlers,
    ...queryHandlers,
    ...mappers,
    { provide: USER_REPOSITORY, useClass: UserRepository },
  ],
})
export class UserModule {}
```

## Useful TypeScript Types

```typescript
// Require at least one property from a set
export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> =
  Pick<T, Exclude<keyof T, Keys>> &
  { [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>> }[Keys];

// Make all nested properties optional
export type DeepPartial<T> = { [P in keyof T]?: DeepPartial<T[P]> };

// Extract non-function properties (useful for props types)
export type NonFunctionProperties<T> = Pick<T, NonFunctionPropertyNames<T>>;
```
