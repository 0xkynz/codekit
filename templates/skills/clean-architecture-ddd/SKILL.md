---
name: clean-architecture-ddd
description: Domain-Driven Design with Clean Architecture — framework-agnostic patterns for entities, value objects, aggregates, use cases, and the dependency rule. Use PROACTIVELY when designing domain models, implementing bounded contexts, structuring layered architectures, separating business logic from infrastructure, or applying DDD tactical patterns in any language or framework.
---

# Clean Architecture + DDD Expert

You are an expert in Domain-Driven Design and Clean Architecture (Robert C. Martin). You help build systems where business logic is isolated, dependencies point inward, and the domain model is the heart of the application.

## When invoked:

1. Identify existing architecture — detect layers, boundaries, and dependency direction
2. Map the domain — entities, value objects, aggregates, and bounded contexts
3. Apply the dependency rule — ensure source code dependencies point inward only
4. Enforce layer responsibilities — no leaking of infrastructure into the domain

## The Dependency Rule

> Source code dependencies must point inward only. Nothing in an inner circle may reference anything in an outer circle.

```
┌─────────────────────────────────────────┐
│  Frameworks & Drivers                   │
│  ┌───────────────────────────────────┐  │
│  │  Interface Adapters               │  │
│  │  ┌─────────────────────────────┐  │  │
│  │  │  Application (Use Cases)    │  │  │
│  │  │  ┌───────────────────────┐  │  │  │
│  │  │  │  Entities (Domain)    │  │  │  │
│  │  │  └───────────────────────┘  │  │  │
│  │  └─────────────────────────────┘  │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

**Inner layers define interfaces. Outer layers implement them.** This is the Dependency Inversion Principle applied at the architectural level.

## Layer → DDD Mapping

| Clean Architecture Layer | DDD Concepts | Allowed Dependencies |
|--------------------------|-------------|---------------------|
| **Entities** (innermost) | Entities, Value Objects, Aggregates, Domain Events, Domain Services | None (pure business logic) |
| **Use Cases** | Application Services, Commands, Queries, DTOs | Entities layer only |
| **Interface Adapters** | Controllers, Presenters, Repository Implementations, Mappers | Use Cases + Entities |
| **Frameworks & Drivers** (outermost) | DB driver, web framework, message queue, external APIs | All inner layers |

## Directory Structure

```
src/
├── domain/                      # ENTITIES LAYER — pure business logic
│   ├── [context]/               # Bounded context (e.g., order, user, billing)
│   │   ├── entities/            # Objects with identity
│   │   ├── value-objects/       # Immutable objects without identity
│   │   ├── aggregates/          # Aggregate roots (consistency boundaries)
│   │   ├── events/              # Domain events
│   │   ├── services/            # Domain services (logic across entities)
│   │   └── types.ts             # Domain types for this context
│   └── shared/                  # Cross-context domain primitives
│       ├── Entity.ts            # Base entity
│       ├── ValueObject.ts       # Base value object
│       ├── AggregateRoot.ts     # Base aggregate
│       └── DomainEvent.ts       # Base event
│
├── application/                 # USE CASES LAYER — orchestration
│   ├── [context]/
│   │   ├── commands/            # Write operations (CreateOrder, CancelOrder)
│   │   ├── queries/             # Read operations (GetOrder, ListOrders)
│   │   └── services/            # Application services (cross-use-case logic)
│   ├── ports/                   # Interfaces that outer layers must implement
│   │   ├── repositories/        # Repository interfaces
│   │   ├── services/            # External service interfaces
│   │   └── messaging/           # Event bus / message queue interfaces
│   └── dtos/                    # Data Transfer Objects for boundary crossing
│
├── adapters/                    # INTERFACE ADAPTERS LAYER
│   ├── controllers/             # HTTP/gRPC/CLI controllers (inbound)
│   ├── repositories/            # Repository implementations (outbound)
│   ├── presenters/              # Response formatting
│   └── mappers/                 # Domain ↔ persistence model mapping
│
└── infrastructure/              # FRAMEWORKS & DRIVERS LAYER
    ├── database/                # DB connection, migrations, ORM config
    ├── http/                    # Web framework setup, middleware, routing
    ├── messaging/               # Message broker setup
    └── config/                  # Environment, DI container bootstrap
```

### Alternate: Domain-Centric Layout

For projects with many bounded contexts, co-locate layers within each context:

```
src/
├── contexts/
│   ├── order/
│   │   ├── domain/              # Entities, VOs, aggregates, events
│   │   ├── application/         # Commands, queries, ports
│   │   ├── adapters/            # Controllers, repo implementations
│   │   └── index.ts             # Public API for this context
│   ├── billing/
│   └── user/
├── shared/                      # Cross-context base classes, shared kernel
└── infrastructure/              # Framework bootstrap (shared across contexts)
```

## Layer Rules

### Entities Layer (Domain)

**Zero dependencies on outer layers.** No imports from application, adapters, or infrastructure. No framework annotations. No ORM decorators. Pure language constructs only.

```typescript
// domain/order/entities/Order.ts
import { AggregateRoot } from '../../shared/AggregateRoot';
import { OrderItem } from '../value-objects/OrderItem';
import { Money } from '../../shared/Money';
import { OrderPlaced } from '../events/OrderPlaced';

interface OrderProps {
  customerId: string;
  items: OrderItem[];
  status: OrderStatus;
  placedAt: Date;
}

export class Order extends AggregateRoot<OrderProps> {
  get total(): Money {
    return this.props.items.reduce(
      (sum, item) => sum.add(item.subtotal),
      Money.zero('USD')
    );
  }

  addItem(item: OrderItem): void {
    if (this.props.status !== 'draft') {
      throw new Error('Cannot modify a placed order');
    }
    this.props.items.push(item);
  }

  place(): void {
    if (this.props.items.length === 0) {
      throw new Error('Cannot place an empty order');
    }
    this.props.status = 'placed';
    this.props.placedAt = new Date();
    this.addDomainEvent(new OrderPlaced(this.id, this.total));
  }
}
```

```typescript
// domain/order/value-objects/OrderItem.ts
import { ValueObject } from '../../shared/ValueObject';
import { Money } from '../../shared/Money';

interface OrderItemProps {
  productId: string;
  quantity: number;
  unitPrice: Money;
}

export class OrderItem extends ValueObject<OrderItemProps> {
  get subtotal(): Money {
    return this.props.unitPrice.multiply(this.props.quantity);
  }

  static create(props: OrderItemProps): OrderItem {
    if (props.quantity < 1) throw new Error('Quantity must be at least 1');
    return new OrderItem(props);
  }
}
```

### Use Cases Layer (Application)

Orchestrates domain objects. Depends only on the domain layer. Defines **ports** (interfaces) that outer layers implement.

```typescript
// application/ports/repositories/OrderRepository.ts
import type { Order } from '../../../domain/order/entities/Order';

export interface OrderRepository {
  save(order: Order): Promise<void>;
  findById(id: string): Promise<Order | null>;
  findByCustomer(customerId: string): Promise<Order[]>;
}
```

```typescript
// application/order/commands/PlaceOrder.ts
import { Order } from '../../../domain/order/entities/Order';
import { OrderItem } from '../../../domain/order/value-objects/OrderItem';
import { Money } from '../../../domain/shared/Money';
import type { OrderRepository } from '../../ports/repositories/OrderRepository';
import type { EventBus } from '../../ports/messaging/EventBus';

interface PlaceOrderInput {
  customerId: string;
  items: { productId: string; quantity: number; unitPrice: number; currency: string }[];
}

export class PlaceOrder {
  constructor(
    private readonly orders: OrderRepository,
    private readonly events: EventBus,
  ) {}

  async execute(input: PlaceOrderInput): Promise<string> {
    const items = input.items.map(i =>
      OrderItem.create({
        productId: i.productId,
        quantity: i.quantity,
        unitPrice: Money.of(i.unitPrice, i.currency),
      })
    );

    const order = Order.create({ customerId: input.customerId, items });
    order.place();

    await this.orders.save(order);
    await this.events.publishAll(order.pullDomainEvents());

    return order.id;
  }
}
```

### Interface Adapters Layer

Translates between external formats and use case inputs/outputs. **Never contains business logic.**

```typescript
// adapters/controllers/OrderController.ts
import type { PlaceOrder } from '../../application/order/commands/PlaceOrder';

export class OrderController {
  constructor(private readonly placeOrder: PlaceOrder) {}

  async handlePlaceOrder(req: { body: unknown }): Promise<{ status: number; body: unknown }> {
    // Validate HTTP input shape (not business rules — that's the domain's job)
    const input = this.parseBody(req.body);
    const orderId = await this.placeOrder.execute(input);
    return { status: 201, body: { id: orderId } };
  }

  private parseBody(body: unknown) { /* schema validation */ }
}
```

```typescript
// adapters/repositories/PostgresOrderRepository.ts
import type { OrderRepository } from '../../application/ports/repositories/OrderRepository';
import type { Order } from '../../domain/order/entities/Order';
import { OrderMapper } from '../mappers/OrderMapper';

export class PostgresOrderRepository implements OrderRepository {
  constructor(private readonly db: DatabaseClient) {}

  async save(order: Order): Promise<void> {
    const record = OrderMapper.toPersistence(order);
    await this.db.query('INSERT INTO orders ...', record);
  }

  async findById(id: string): Promise<Order | null> {
    const row = await this.db.query('SELECT * FROM orders WHERE id = $1', [id]);
    return row ? OrderMapper.toDomain(row) : null;
  }
}
```

### Boundary Crossing

Data crosses boundaries as **simple structures** — DTOs, plain objects, or primitives. Never pass entities or ORM models across layer boundaries.

```
Controller → (DTO) → Use Case → (Domain Objects) → Domain Logic
                                                          ↓
Repository Interface ← (Domain Object) ← Use Case Result
         ↓
Repository Impl → (Mapper) → Persistence Model → Database
```

## Base Building Blocks

For reference implementations of Entity, ValueObject, AggregateRoot, DomainEvent, and Result type — see `references/building-blocks.md`.

## Testing Strategy

| Layer | Test Type | Dependencies |
|-------|-----------|-------------|
| **Domain** | Unit tests | None — pure logic, no mocks needed |
| **Use Cases** | Unit tests | Mock repositories and services via ports |
| **Adapters** | Integration tests | Real DB (test container) or in-memory |
| **Infrastructure** | E2E / smoke tests | Full stack running |

Domain layer tests should be the fastest and most numerous. If domain tests need mocks, the domain has leaked infrastructure concerns.

## Decision Tree

```
Is it a business rule?
├── Yes → Domain layer (entity method or domain service)
│   Is it about a single entity?
│   ├── Yes → Entity method
│   └── No → Domain service
└── No
    Is it orchestrating multiple steps?
    ├── Yes → Use case (application layer)
    └── No
        Is it translating data formats?
        ├── Yes → Adapter (mapper, presenter, controller)
        └── No → Infrastructure (config, framework setup)
```

```
Where does this interface belong?
├── Repository interface → application/ports/repositories/
├── External service interface → application/ports/services/
├── Event bus interface → application/ports/messaging/
└── Implementation of any above → adapters/ or infrastructure/
```

## Anti-Patterns

| Anti-Pattern | Why It's Wrong | Fix |
|-------------|---------------|-----|
| Entity imports ORM decorator | Domain depends on infrastructure | Use mapper in adapter layer |
| Use case returns entity to controller | Leaks domain model across boundary | Return DTO or primitive |
| Business rule in controller | Logic in wrong layer | Move to entity or domain service |
| Repository interface in domain layer | Domain shouldn't know about persistence | Move to application/ports/ |
| God aggregate with 20+ methods | Aggregate too large | Split into smaller aggregates, use domain events |
| Anemic domain model | Entities are just data bags | Move behavior into entities |
| Domain event carries entity reference | Events should be serializable | Carry only IDs and primitives |
