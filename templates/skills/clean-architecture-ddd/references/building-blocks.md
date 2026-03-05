# Building Blocks — Base Class Reference

Framework-agnostic TypeScript implementations. Adapt to your language.

## Entity

Objects defined by identity, not attributes. Two entities with the same properties but different IDs are different.

```typescript
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

  equals(other: Entity<T>): boolean {
    return this._id === other._id;
  }
}
```

## Value Object

Immutable objects defined by their attributes. Two value objects with the same properties are equal.

```typescript
export abstract class ValueObject<T> {
  protected readonly props: T;

  constructor(props: T) {
    this.props = Object.freeze(props);
  }

  equals(other: ValueObject<T>): boolean {
    return JSON.stringify(this.props) === JSON.stringify(other.props);
  }
}
```

## Aggregate Root

An entity that serves as the entry point to a consistency boundary. All modifications to the aggregate go through the root. Collects domain events for later dispatch.

```typescript
import { Entity } from './Entity';
import type { DomainEvent } from './DomainEvent';

export abstract class AggregateRoot<T> extends Entity<T> {
  private _domainEvents: DomainEvent[] = [];

  protected addDomainEvent(event: DomainEvent): void {
    this._domainEvents.push(event);
  }

  pullDomainEvents(): DomainEvent[] {
    const events = [...this._domainEvents];
    this._domainEvents = [];
    return events;
  }
}
```

## Domain Event

Something that happened in the domain that other parts of the system may react to. Always past tense. Carries only IDs and primitives — never entity references.

```typescript
export interface DomainEvent {
  readonly eventName: string;
  readonly occurredAt: Date;
  readonly payload: Record<string, unknown>;
}

export function createDomainEvent(
  eventName: string,
  payload: Record<string, unknown>,
): DomainEvent {
  return { eventName, occurredAt: new Date(), payload };
}

// Example
export class OrderPlaced implements DomainEvent {
  readonly eventName = 'order.placed';
  readonly occurredAt = new Date();
  readonly payload: Record<string, unknown>;

  constructor(orderId: string, totalAmount: number, currency: string) {
    this.payload = { orderId, totalAmount, currency };
  }
}
```

## Result Type

Encode success/failure without exceptions for expected domain outcomes. Reserve exceptions for truly unexpected errors.

```typescript
export type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

export const Result = {
  ok: <T>(value: T): Result<T, never> => ({ ok: true, value }),
  fail: <E>(error: E): Result<never, E> => ({ ok: false, error }),
};

// Usage in domain
class Email extends ValueObject<{ value: string }> {
  static create(raw: string): Result<Email, string> {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw)) {
      return Result.fail('Invalid email format');
    }
    return Result.ok(new Email({ value: raw.toLowerCase() }));
  }
}
```

## Repository Interface (Port)

Defined in the application layer. Implemented in the adapter layer.

```typescript
export interface Repository<T> {
  save(entity: T): Promise<void>;
  findById(id: string): Promise<T | null>;
  delete(id: string): Promise<void>;
}

// Extended for specific aggregate
export interface OrderRepository extends Repository<Order> {
  findByCustomer(customerId: string): Promise<Order[]>;
  findByStatus(status: OrderStatus): Promise<Order[]>;
}
```

## Event Bus Interface (Port)

```typescript
export interface EventBus {
  publish(event: DomainEvent): Promise<void>;
  publishAll(events: DomainEvent[]): Promise<void>;
  subscribe(eventName: string, handler: EventHandler): void;
}

export type EventHandler = (event: DomainEvent) => Promise<void>;
```

## Mapper Pattern

Translates between domain objects and persistence models. Lives in the adapter layer.

```typescript
// adapters/mappers/OrderMapper.ts
export class OrderMapper {
  static toDomain(row: OrderRow): Order {
    const items = row.items.map(i =>
      OrderItem.create({
        productId: i.product_id,
        quantity: i.quantity,
        unitPrice: Money.of(i.unit_price, i.currency),
      })
    );
    return new Order(
      { customerId: row.customer_id, items, status: row.status, placedAt: row.placed_at },
      row.id,
    );
  }

  static toPersistence(order: Order): OrderRow {
    return {
      id: order.id,
      customer_id: order.props.customerId,
      status: order.props.status,
      placed_at: order.props.placedAt,
      items: order.props.items.map(i => ({
        product_id: i.props.productId,
        quantity: i.props.quantity,
        unit_price: i.props.unitPrice.amount,
        currency: i.props.unitPrice.currency,
      })),
    };
  }
}
```

## Money Value Object

Common cross-context value object for monetary amounts.

```typescript
interface MoneyProps {
  amount: number;
  currency: string;
}

export class Money extends ValueObject<MoneyProps> {
  get amount(): number { return this.props.amount; }
  get currency(): string { return this.props.currency; }

  add(other: Money): Money {
    this.assertSameCurrency(other);
    return Money.of(this.amount + other.amount, this.currency);
  }

  multiply(factor: number): Money {
    return Money.of(this.amount * factor, this.currency);
  }

  static of(amount: number, currency: string): Money {
    return new Money({ amount, currency });
  }

  static zero(currency: string): Money {
    return new Money({ amount: 0, currency });
  }

  private assertSameCurrency(other: Money): void {
    if (this.currency !== other.currency) {
      throw new Error(`Currency mismatch: ${this.currency} vs ${other.currency}`);
    }
  }
}
```
