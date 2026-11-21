# Chapter 8: Microservices and Event-Driven Architecture

## 8.1 Domain Decomposition Strategies and the Database-Per-Service Rule

Microservice architectures replace a single monolithic deployment unit with an ensemble of fine-grained, independently deployable services communicating over network boundaries. When executed correctly, microservices empower autonomous engineering squads to deploy code multiple times per day without coordination bottlenecks. When executed poorly, they devolve into a "distributed monolith"—inheriting all the complexity of distributed systems without any of the organizational velocity benefits.

### The Database-Per-Service Mandate

The most critical architectural rule in microservices engineering is: **Every microservice must possess exclusive ownership of its persistent storage. No service may ever read or write directly to another service's database.**

```
CORRECT: Decoupled via API / Events           ANTI-PATTERN: Shared Database Monolith
┌────────────────┐    ┌────────────────┐       ┌────────────────┐    ┌────────────────┐
│ Orders Service │    │ Invoicing Svc  │       │ Orders Service │    │ Invoicing Svc  │
└───────┬────────┘    └───────┬────────┘       └───────┬────────┘    └───────┬────────┘
        │                     │                        │                     │
        v                     v                        +----------+----------+
┌────────────────┐    ┌────────────────┐                                  │
│   Orders DB    │    │  Invoicing DB  │                                  v
│  (PostgreSQL)  │    │  (PostgreSQL)  │                       ┌──────────────────────┐
└────────────────┘    └────────────────┘                       │ Shared Enterprise DB │
                                                               └──────────────────────┘
```

Violating this rule introduces hidden couplings:
- An index optimization or schema column modification executed by the Orders squad silently breaks SQL queries in the Invoicing service.
- Database connection pools become shared contention points, where an unindexed query in Invoicing exhausts database connections for the revenue-critical Orders service [See Section 5.3].
- Independent horizontal scaling becomes impossible because the shared database saturates its CPU regardless of which microservice generated the workload.

---

## 8.2 Synchronous RPC (gRPC / HTTP/2) vs. Asynchronous Message Orchestration

Selecting the inter-service communication protocol dictates the system's operational coupling, throughput, and failure blast radius.

### Protocol Comparison Matrix

| Protocol | Transport Layer | Serialization Format | Typical Latency | Primary Enterprise Use Case |
| :--- | :--- | :--- | :--- | :--- |
| **gRPC** | HTTP/2 (Multiplexed streaming) | Protocol Buffers (Binary) | Sub-millisecond (0.2–1.5ms) | High-throughput, low-latency synchronous inter-service queries within a Kubernetes cluster. |
| **REST / HTTP** | HTTP/1.1 or HTTP/2 | JSON (Text) | Moderate (3–15ms) | Public-facing APIs, external webhooks, developer ecosystem interfaces. |
| **Kafka / RabbitMQ** | TCP (Persistent socket) | Avro / JSON / Protobuf | Asynchronous (Decoupled) | High-volume domain event streaming, transactional outbox publishing, event sourcing. |

```protobuf
// Production gRPC Definition: billing_service.proto
syntax = "proto3";

package enterprise.billing.v1;

option go_package = "enterprise/billing/v1;billingv1";

service BillingService {
  rpc AuthorizeTransaction (AuthorizeTransactionRequest) returns (AuthorizeTransactionResponse);
  rpc StreamPaymentEvents (PaymentEventsSubscription) returns (stream PaymentEventNotification);
}

message AuthorizeTransactionRequest {
  string organization_id = 1;
  string order_id = 2;
  int64 amount_cents = 3;
  string currency = 4;
  string idempotency_key = 5;
}

message AuthorizeTransactionResponse {
  string authorization_code = 1;
  string status = 2;
  int64 processed_at_unix_ms = 3;
}

message PaymentEventsSubscription {
  string organization_id = 1;
}

message PaymentEventNotification {
  string event_id = 1;
  string order_id = 2;
  string event_type = 3;
}
```

---

## 8.3 Distributed Data Consistency: Two-Phase Commit Limitations vs. Saga Pattern

In a monolithic architecture, atomic multi-table changes are governed by ACID database transactions. In a microservices architecture spanning Orders, Inventory, and Payments, a business transaction crosses network and database boundaries.

### The Failure of Distributed Two-Phase Commit (2PC)

Traditional distributed transactions rely on the **Two-Phase Commit (2PC)** protocol (`PREPARE` and `COMMIT` phases coordinated by an XA transaction manager). In high-scale cloud environments, 2PC is fundamentally unviable:
1. **Blocking Protocol:** If the coordinator or any participating node crashes during the commit phase, all participating database rows remain locked indefinitely.
2. **Availability Degradation:** In accordance with the CAP theorem [See Section 0.3], if any network partition occurs across nodes, the entire transaction aborts. The availability of an $N$-node 2PC transaction decreases exponentially ($A_{\text{system}} = A_{\text{node}}^N$).

### The Saga Pattern: Orchestration vs. Choreography

A **Saga** is a sequence of local transactions. Each local transaction updates the database within a single microservice and emits a domain event. If a step fails, the Saga coordinates a series of **Compensating Transactions** that undo the changes made by preceding steps:

| Dimension | Saga Choreography | Saga Orchestration |
| :--- | :--- | :--- |
| **Coordination Model** | Decentralized; services react directly to sibling domain events over Kafka. | Centralized; a dedicated Saga Orchestrator engine (e.g. Temporal) directs steps. |
| **Coupling Profile** | Low structural coupling; high semantic/eventual workflow coupling. | Centralized workflow definition; microservices expose simple RPC endpoints. |
| **Observability** | Difficult; tracing a distributed workflow requires piecing together correlation IDs [See Section 13.2]. | Exceptional; workflow visualizer displays exact state machine progress and failures. |
| **Ideal Use Case** | Simple 2–3 step workflows (e.g., OrderPlaced $\to$ SendEmailNotification). | Complex, multi-branch enterprise workflows (e.g., Order Fulfillment with Payments, Inventory, Fraud, Shipping). |

```
Saga Orchestration Flow:
[ Client ] -> (Initiate) -> [ Order Orchestrator ]
                                   │
  1. Authorize Payment             ├─────────────────> [ Payment Service ]  (Success)
  2. Reserve Inventory             ├─────────────────> [ Inventory Service ] (OUT OF STOCK!)
  3. Compensating Action (Rollback) └─────────────────> [ Payment Service: REFUND ]
```

---

## 8.4 Reliable Event Publishing: The Transactional Outbox Pattern and Change Data Capture (CDC)

A fatal flaw in naive event-driven services is the "Dual Write Anti-Pattern":

```typescript
// DANGEROUS ANTI-PATTERN: Dual Write
await db.orders.insert(orderData); // Database write succeeds
await kafkaProducer.send('order-events', orderData); // Network failure! Event lost forever!
```

If the database write succeeds but the Kafka producer times out or crashes before sending the event, the rest of the enterprise never learns that the order was created, resulting in catastrophic state desynchronization.

### The Transactional Outbox Pattern

The **Transactional Outbox Pattern** guarantees **At-Least-Once Delivery** by storing the domain event inside the *same database transaction* as the business entity mutation, leveraging local ACID guarantees:

```sql
-- Transactional Outbox Table Schema in PostgreSQL
CREATE TABLE outbox_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aggregate_type VARCHAR(64) NOT NULL,
  aggregate_id VARCHAR(128) NOT NULL,
  event_type VARCHAR(128) NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ NULL
);

CREATE INDEX idx_outbox_unprocessed 
ON outbox_events (created_at ASC) 
WHERE processed_at IS NULL;
```

```typescript
// Atomic Outbox Insertion inside PostgreSQL Transaction
import { PoolClient } from 'pg';

export async function createOrderWithOutbox(
  client: PoolClient,
  order: { id: string; customerId: string; totalCents: number }
): Promise<void> {
  // 1. Mutate business state
  await client.query(
    'INSERT INTO orders (id, customer_id, total_cents, status) VALUES ($1, $2, $3, $4)',
    [order.id, order.customerId, order.totalCents, 'PLACED']
  );

  // 2. Insert event record in the SAME transactional commit
  await client.query(
    `INSERT INTO outbox_events (aggregate_type, aggregate_id, event_type, payload)
     VALUES ($1, $2, $3, $4)`,
    [
      'ORDER',
      order.id,
      'ORDER_PLACED_V1',
      JSON.stringify({
        orderId: order.id,
        customerId: order.customerId,
        totalCents: order.totalCents,
        timestamp: new Date().toISOString()
      })
    ]
  );
}
```

### Change Data Capture (CDC) with Debezium

Rather than having an application worker poll the `outbox_events` table (which introduces database polling latency and row lock overhead), enterprise architectures deploy **Debezium**. Debezium hooks directly into the PostgreSQL Write-Ahead Log (WAL) via logical decoding replication slots [See Section 6.5], streaming outbox records directly into Apache Kafka with sub-second latency and zero database query overhead.

---

## 8.5 Distributed Fault Tolerance: Circuit Breakers, Bulkheads, and Graceful Degradation

In distributed systems, failures propagate rapidly. If Service C slows down from 10ms to 8,000ms, Service B's worker threads block waiting for Service C, exhausting Service B's connection pool. Service A then blocks waiting for Service B, triggering a complete, cluster-wide cascading outage.

### The Circuit Breaker State Machine

A **Circuit Breaker** wraps remote calls, monitoring failure and latency thresholds:
1. **Closed (Normal):** Requests pass through. If the failure rate exceeds a threshold (e.g. 50% over a 10-second window), the breaker trips into **Open**.
2. **Open (Failing):** Inbound requests fail *immediately* without attempting network I/O, preventing resource starvation and allowing the downstream service time to recover. Fallback logic is returned.
3. **Half-Open (Testing):** After a cooldown reset period (e.g. 30 seconds), a limited number of test requests are permitted through. If they succeed, the breaker resets to **Closed**; if they fail, it immediately returns to **Open**.

```typescript
import CircuitBreaker from 'opossum';

const options: CircuitBreaker.Options = {
  timeout: 3000, // Trigger failure if remote call exceeds 3 seconds
  errorThresholdPercentage: 50, // Open breaker if 50% of requests fail
  resetTimeout: 30000, // Wait 30 seconds in OPEN before transitioning to HALF-OPEN
  volumeThreshold: 10 // Minimum 10 requests within window before calculating error rate
};

export function createProtectedPaymentClient(remoteCall: (payload: any) => Promise<any>) {
  const breaker = new CircuitBreaker(remoteCall, options);

  // Fallback executed immediately when breaker is OPEN
  breaker.fallback((payload, err) => {
    console.warn(`[CircuitBreaker] Payment gateway unavailable. Returning queued fallback: ${err.message}`);
    return {
      status: 'QUEUED_FOR_OFFLINE_SETTLEMENT',
      transactionId: null,
      warning: 'Upstream gateway degraded. Transaction deferred to background reconciliation.'
    };
  });

  breaker.on('open', () => console.error('[CircuitBreaker] State Changed: OPEN. Downstream degraded.'));
  breaker.on('halfOpen', () => console.log('[CircuitBreaker] State Changed: HALF-OPEN. Probing downstream health...'));
  breaker.on('close', () => console.log('[CircuitBreaker] State Changed: CLOSED. Downstream restored.'));

  return breaker;
}
```

---
