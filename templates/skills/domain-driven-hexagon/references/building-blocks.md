# Building Blocks — Base Class Reference

TypeScript implementations. Framework-agnostic — adapt to your DI framework.

## Entity Base

Objects defined by identity. Two entities with same properties but different IDs are different. Validates invariants on construction and before every save.

```typescript
export type AggregateID = string;

export interface BaseEntityProps {
  id: AggregateID;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateEntityProps<T> {
  id: AggregateID;
  props: T;
  createdAt?: Date;
  updatedAt?: Date;
}

export abstract class Entity<EntityProps> {
  protected readonly props: EntityProps;
  protected abstract _id: AggregateID;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  constructor({ id, createdAt, updatedAt, props }: CreateEntityProps<EntityProps>) {
    this.setId(id);
    this.validateProps(props);
    const now = new Date();
    this._createdAt = createdAt || now;
    this._updatedAt = updatedAt || now;
    this.props = props;
    this.validate();
  }

  get id(): AggregateID { return this._id; }
  get createdAt(): Date { return this._createdAt; }
  get updatedAt(): Date { return this._updatedAt; }

  /** Enforce domain invariants. Called in constructor and by repository before save. */
  public abstract validate(): void;

  public equals(object?: Entity<EntityProps>): boolean {
    if (!object || !(object instanceof Entity)) return false;
    return this._id === object._id;
  }

  /** Returns frozen copy of all props including base props. */
  public getProps(): EntityProps & BaseEntityProps {
    const copy = {
      id: this._id,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
      ...this.props,
    };
    return Object.freeze(copy);
  }

  /** Recursively converts entity to plain object (for logging/testing). */
  public toObject(): unknown {
    const plainProps = convertPropsToObject(this.props);
    return Object.freeze({
      id: this._id,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
      ...plainProps,
    });
  }

  private setId(id: AggregateID): void {
    this._id = id;
  }

  private validateProps(props: EntityProps): void {
    if (Guard.isEmpty(props)) throw new ArgumentNotProvidedException('Entity props cannot be empty');
    if (typeof props !== 'object') throw new ArgumentInvalidException('Entity props must be an object');
    if (Object.keys(props as any).length > 50) throw new ArgumentOutOfRangeException('Entity props too large');
  }
}
```

## Aggregate Root Base

Extends Entity. Collects domain events and publishes them after persistence.

```typescript
export abstract class AggregateRoot<EntityProps> extends Entity<EntityProps> {
  private _domainEvents: DomainEvent[] = [];

  protected addEvent(domainEvent: DomainEvent): void {
    this._domainEvents.push(domainEvent);
  }

  public clearEvents(): void {
    this._domainEvents = [];
  }

  public async publishEvents(logger: LoggerPort, eventEmitter: EventEmitter): Promise<void> {
    await Promise.all(
      this._domainEvents.map(async (event) => {
        logger.debug(`[${event.constructor.name}] ${event.aggregateId}`);
        return eventEmitter.emitAsync(event.constructor.name, event);
      }),
    );
    this.clearEvents();
  }
}
```

**Rule:** Only Aggregate Roots are obtained from repositories. Everything inside the aggregate boundary is accessed through traversal from the root.

## Value Object Base

Immutable objects defined by their attributes. Equality is structural. Validates on construction.

```typescript
export type Primitives = string | number | boolean;

export interface DomainPrimitive<T extends Primitives | Date> {
  value: T;
}

type ValueObjectProps<T> = T extends Primitives | Date ? DomainPrimitive<T> : T;

export abstract class ValueObject<T> {
  protected readonly props: ValueObjectProps<T>;

  constructor(props: ValueObjectProps<T>) {
    this.checkIfEmpty(props);
    this.validate(props);
    this.props = props;
  }

  /** Override to enforce constraints specific to this value object. */
  protected abstract validate(props: ValueObjectProps<T>): void;

  public equals(vo?: ValueObject<T>): boolean {
    if (!vo) return false;
    return JSON.stringify(this.props) === JSON.stringify(vo.props);
  }

  /** Extracts the raw value. Single primitives return the primitive; objects return frozen copy. */
  public unpack(): T {
    if (this.isDomainPrimitive(this.props)) {
      return this.props.value as unknown as T;
    }
    const copy = convertPropsToObject(this.props);
    return Object.freeze(copy) as T;
  }

  private checkIfEmpty(props: ValueObjectProps<T>): void {
    if (Guard.isEmpty(props)) {
      throw new ArgumentNotProvidedException('Value Object props cannot be empty');
    }
  }

  private isDomainPrimitive(obj: unknown): obj is DomainPrimitive<T & (Primitives | Date)> {
    return Object.prototype.hasOwnProperty.call(obj, 'value');
  }
}
```

### Domain Primitive Pattern

Wrap single primitives to add validation and type safety:

```typescript
export class Email extends ValueObject<string> {
  get value(): string { return this.props.value; }

  protected validate({ value }: DomainPrimitive<string>): void {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
      throw new ArgumentInvalidException('Invalid email');
  }

  static create(email: string): Email {
    return new Email({ value: email.toLowerCase() });
  }
}
```

### Multi-Property Value Object

```typescript
export interface AddressProps {
  country: string;
  postalCode: string;
  street: string;
}

export class Address extends ValueObject<AddressProps> {
  get country(): string { return this.props.country; }
  get postalCode(): string { return this.props.postalCode; }
  get street(): string { return this.props.street; }

  protected validate(props: AddressProps): void {
    if (!Guard.lengthIsBetween(props.country, 2, 50))
      throw new ArgumentOutOfRangeException('country is out of range');
    if (!Guard.lengthIsBetween(props.street, 2, 200))
      throw new ArgumentOutOfRangeException('street is out of range');
    if (!Guard.lengthIsBetween(props.postalCode, 2, 20))
      throw new ArgumentOutOfRangeException('postalCode is out of range');
  }
}
```

## Domain Event Base

Events carry metadata for observability. Always named in past tense. Carry only IDs and primitives — never entity references.

```typescript
type DomainEventMetadata = {
  readonly timestamp: number;
  readonly correlationId: string;
  readonly causationId?: string;
  readonly userId?: string;
};

export type DomainEventProps<T> = Omit<T, 'id' | 'metadata'> & {
  aggregateId: string;
  metadata?: DomainEventMetadata;
};

export abstract class DomainEvent {
  public readonly id: string;
  public readonly aggregateId: string;
  public readonly metadata: DomainEventMetadata;

  constructor(props: DomainEventProps<unknown>) {
    this.id = randomUUID();
    this.aggregateId = props.aggregateId;
    this.metadata = {
      correlationId: props?.metadata?.correlationId || RequestContextService.getRequestId(),
      causationId: props?.metadata?.causationId,
      timestamp: props?.metadata?.timestamp || Date.now(),
      userId: props?.metadata?.userId,
    };
  }
}
```

## Command Base

Serializable intent objects with metadata for auditing and tracing.

```typescript
type CommandMetadata = {
  readonly correlationId: string;
  readonly causationId?: string;
  readonly userId?: string;
  readonly timestamp: number;
};

export type CommandProps<T> = Omit<T, 'id' | 'metadata'> & Partial<Command>;

export class Command {
  readonly id: string;
  readonly metadata: CommandMetadata;

  constructor(props: CommandProps<unknown>) {
    this.id = props.id || randomUUID();
    this.metadata = {
      correlationId: props?.metadata?.correlationId || RequestContextService.getRequestId(),
      causationId: props?.metadata?.causationId,
      timestamp: props?.metadata?.timestamp || Date.now(),
      userId: props?.metadata?.userId,
    };
  }
}
```

## Query Base

```typescript
export abstract class QueryBase {}

export abstract class PaginatedQueryBase extends QueryBase {
  limit: number;
  offset: number;
  orderBy: OrderBy;
  page: number;

  constructor(props: PaginatedParams<PaginatedQueryBase>) {
    super();
    this.limit = props.limit || 20;
    this.offset = props.page ? props.page * this.limit : 0;
    this.page = props.page || 0;
    this.orderBy = props.orderBy || { field: true, param: 'desc' };
  }
}
```

## Repository Port

```typescript
export class Paginated<T> {
  readonly count: number;
  readonly limit: number;
  readonly page: number;
  readonly data: readonly T[];
}

export type OrderBy = { field: string | true; param: 'asc' | 'desc' };
export type PaginatedQueryParams = { limit: number; page: number; offset: number; orderBy: OrderBy };

export interface RepositoryPort<Entity> {
  insert(entity: Entity | Entity[]): Promise<void>;
  findOneById(id: string): Promise<Option<Entity>>;
  findAll(): Promise<Entity[]>;
  findAllPaginated(params: PaginatedQueryParams): Promise<Paginated<Entity>>;
  delete(entity: Entity): Promise<boolean>;
  transaction<T>(handler: () => Promise<T>): Promise<T>;
}
```

`Option<Entity>` (from oxide.ts) forces callers to handle the "not found" case without throwing.

## Guard Utility

Fail-fast validators for domain guarding.

```typescript
export class Guard {
  /** Returns true if value is null, undefined, empty string, empty array, or empty object. 0 and false are NOT empty. */
  static isEmpty(value: unknown): boolean {
    if (typeof value === 'number' || typeof value === 'boolean') return false;
    if (value === undefined || value === null) return true;
    if (typeof value === 'string' && value.trim() === '') return true;
    if (Array.isArray(value) && value.length === 0) return true;
    if (typeof value === 'object' && Object.keys(value).length === 0) return true;
    return false;
  }

  static lengthIsBetween(value: number | string | unknown[], min: number, max: number): boolean {
    const len = typeof value === 'number'
      ? value.toString().length
      : value.length;
    return len >= min && len <= max;
  }
}
```

## Mapper Interface

Three-way translation between domain, persistence, and API:

```typescript
export interface Mapper<DomainEntity extends Entity<any>, DbRecord, Response = any> {
  toPersistence(entity: DomainEntity): DbRecord;
  toDomain(record: any): DomainEntity;
  toResponse(entity: DomainEntity): Response;
}
```
