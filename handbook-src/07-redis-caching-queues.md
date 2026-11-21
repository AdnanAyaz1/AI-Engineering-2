# Chapter 7: Redis Caching, Distributed Primitives, and Background Jobs

## 7.1 Enterprise Caching Patterns: Cache-Aside, Write-Through, and Cache Invalidation Realities

Phil Karlton famously observed: *"There are only two hard things in Computer Science: cache invalidation and naming things."* In distributed enterprise systems, caching is essential to shield primary relational databases from read query saturation, but incorrect caching topologies produce stale reads, ghost updates, and cache synchronization debt.

### Caching Architecture Patterns

| Pattern | Write Path Mechanics | Read Path Mechanics | Latency Profile | Primary Risk / Drawback |
| :--- | :--- | :--- | :--- | :--- |
| **Cache-Aside (Lazy Loading)** | Application writes directly to DB; invalidates or deletes key in cache. | App checks cache; on miss, loads from DB and populates cache with TTL. | Lowest write latency; read miss incurs double latency (cache + DB). | Stale window if concurrent write invalidates cache while slow read repopulates old value. |
| **Write-Through** | Application writes to cache; cache synchronously writes to underlying DB. | App reads from cache exclusively; misses are loaded synchronously by cache layer. | Higher write latency (dual synchronous writes); high read speed. | Complex cache orchestration; cache failure blocks database writes. |
| **Write-Behind (Write-Back)** | App writes to cache and returns 200 OK immediately; cache asynchronously flushes batch to DB. | App reads from cache exclusively. | Ultra-low write latency; highly batched DB writes reduce DB load. | **Risk of data loss** if Redis node crashes before asynchronous write is flushed to persistent storage. |
| **Refresh-Ahead** | Cache automatically reloads frequently accessed keys from DB prior to TTL expiration. | App reads almost exclusively hits from cache. | Consistent sub-millisecond read latency. | Inaccurate prediction algorithms waste database compute refreshing unread keys. |

```typescript
// Production Cache-Aside Pattern Implementation with Jittered TTL
import Redis from 'ioredis';

export class CacheAsideRepository<T> {
  constructor(
    private readonly redis: Redis,
    private readonly defaultTtlSeconds: number = 3600
  ) {}

  public async getOrSet(
    cacheKey: string,
    fetchFromDb: () => Promise<T>,
    customTtlSeconds?: number
  ): Promise<T> {
    // 1. Attempt retrieval from Redis
    const cached = await this.redis.get(cacheKey);
    if (cached !== null) {
      return JSON.parse(cached) as T;
    }

    // 2. Cache Miss: Retrieve from database
    const freshData = await fetchFromDb();

    if (freshData !== null && freshData !== undefined) {
      // 3. Add random jitter (+/- 10%) to prevent synchronized Cache Avalanches
      const baseTtl = customTtlSeconds ?? this.defaultTtlSeconds;
      const jitter = Math.floor(baseTtl * 0.1 * (Math.random() * 2 - 1));
      const finalTtl = Math.max(60, baseTtl + jitter);

      await this.redis.set(cacheKey, JSON.stringify(freshData), 'EX', finalTtl);
    }

    return freshData;
  }

  public async invalidate(cacheKey: string): Promise<void> {
    await this.redis.del(cacheKey);
  }
}
```

---

## 7.2 Cache Failure Modes: Mitigating Stampedes, Penetration, and Cascading Avalanches

When caching infrastructure fails at enterprise scale, the failure is rarely limited to Redis. In unbuffered architectures, cache failures cascade directly into the primary database cluster, triggering total outage events.

### 1. Cache Stampede (Dogpiling / Thundering Herd)

- **Scenario:** A high-traffic cache key (e.g., the home page catalog, accessed 50,000 times per second) expires. In the 250 milliseconds it takes for a single backend worker to query PostgreSQL and repopulate the cache, 12,500 concurrent requests experience a cache miss and simultaneously execute the expensive query against PostgreSQL, crushing the connection pool [See Section 5.3].
- **Mitigation:** **Probabilistic Early Expiration (XFetch Algorithm)** or **Distributed Mutex Locking**. The XFetch algorithm computes a dynamic probability of recomputing the value before it officially expires based on read frequency and computation time:

$$P(\text{recompute}) = -\beta \times \delta \times \ln(\text{random}()) > \text{remaining\_ttl}$$

Where $\delta$ is the delta computation time in seconds, and $\beta > 0$ is an aggressiveness constant.

### 2. Cache Penetration

- **Scenario:** Attackers query millions of non-existent resource IDs (`/v1/users/uuid_not_found_999`). Because the record does not exist in the database, the cache never stores a value. Every single malicious request bypasses the cache entirely and hits the database.
- **Mitigation:**
  - **Cache Null Objects:** Store a synthetic sentinel value (`{ "_empty": true }`) in Redis with a short TTL (e.g., 60 seconds).
  - **Bloom Filters:** Deploy a Redis Bloom Filter (`BF.ADD` / `BF.EXISTS`). If the Bloom Filter returns false, the record definitively does not exist, permitting immediate 404 response generation without querying PostgreSQL.

### 3. Cache Avalanche

- **Scenario:** Thousands of cached keys are initialized during deployment with an identical 24-hour expiration time (`EX 86400`). Exactly 24 hours later, thousands of keys expire simultaneously, causing database CPU utilization to spike to 100%.
- **Mitigation:** Always apply uniform random jitter to TTL configurations (e.g., `TTL = base_ttl + random_range(-300, 300)`).

---

## 7.3 Distributed Synchronization: Single-Instance Redis Mutex vs. Multi-Master Redlock

When coordinating actions across multiple stateless Node.js microservice instances (e.g., preventing duplicate billing runs or enforcing single-leader batch jobs), services require distributed mutex locks.

### The Single-Instance Safe Mutex Pattern

A naive `SETNX` lock that deletes the key via `DEL` is vulnerable to race conditions: if Process A acquires the lock, experiences an unexpected garbage collection pause, its TTL expires, and Process B acquires the lock, Process A will resume and delete Process B's active lock!

To acquire a lock safely, the client must store a high-entropy random token and release the lock using an atomic Lua script:

```typescript
import crypto from 'node:crypto';
import Redis from 'ioredis';

export class RedisDistributedLock {
  private readonly releaseScript = `
    if redis.call("get", KEYS[1]) == ARGV[1] then
      return redis.call("del", KEYS[1])
    else
      return 0
    end
  `;

  constructor(private readonly redis: Redis) {}

  public async acquire(
    resourceKey: string,
    ttlMs: number = 10000
  ): Promise<{ token: string } | null> {
    const token = crypto.randomUUID();
    const key = `lock:${resourceKey}`;

    // Atomically set string if not exists with millisecond TTL (PX NX)
    const result = await this.redis.set(key, token, 'PX', ttlMs, 'NX');
    if (result === 'OK') {
      return { token };
    }
    return null;
  }

  public async release(resourceKey: string, token: string): Promise<boolean> {
    const key = `lock:${resourceKey}`;
    const result = await this.redis.eval(this.releaseScript, 1, key, token);
    return result === 1;
  }
}
```

> [!WARNING]
> Martin Kleppmann's critique of the Redlock algorithm highlights that in asynchronous networks with uncontrolled process pauses (e.g., V8 GC pauses) and clock drift, distributed locks cannot guarantee absolute mutual exclusion for storage systems without storage-level fencing tokens (monotonic version checks enforced by the receiving database).

---

## 7.4 Asynchronous Task Processing with BullMQ, Redis Streams, and Consumer Groups

Microservices must offload slow, I/O-intensive, or external third-party API tasks (e.g., generating PDF documents, sending transactional emails, generating OpenAI embeddings) to asynchronous background workers.

### BullMQ Architecture

**BullMQ** leverages Redis Streams and sorted sets to implement high-performance, fault-tolerant message queuing:

```typescript
import { Queue, Worker, type Job } from 'bullmq';
import Redis from 'ioredis';

const connection = new Redis(process.env.REDIS_URL!, { maxRetriesPerRequest: null });

export interface DocumentGenerationPayload {
  documentId: string;
  organizationId: string;
  templateType: 'FINANCIAL_REPORT' | 'SECURITY_AUDIT';
}

// 1. Queue Producer Configuration
export const documentQueue = new Queue<DocumentGenerationPayload>('document-generation', {
  connection,
  defaultJobOptions: {
    attempts: 5,
    backoff: {
      type: 'exponential',
      delay: 2000 // 2s, 4s, 8s, 16s, 32s
    },
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 5000 }
  }
});

// 2. High-Reliability Worker Consumer
export const documentWorker = new Worker<DocumentGenerationPayload>(
  'document-generation',
  async (job: Job<DocumentGenerationPayload>) => {
    console.log(`[Worker] Processing Job ${job.id} for Document ${job.data.documentId}`);

    // Track execution progress for live dashboard telemetry
    await job.updateProgress(25);

    // Simulated task execution
    if (Math.random() < 0.1) {
      throw new Error('Transient PDF rasterization engine error.');
    }

    await job.updateProgress(100);
    return { status: 'SUCCESS', generatedBytes: 1048576 };
  },
  {
    connection,
    concurrency: 8, // Run 8 concurrent job processors per worker process
    limiter: {
      max: 100,
      duration: 60000 // Max 100 jobs processed per minute
    }
  }
);
```

---

## 7.5 Dead-Letter Queues (DLQ), Exponential Backoff Jitter, and Worker Idempotency

When background jobs encounter persistent, unrecoverable exceptions (e.g., invalid payload schemas, corrupted input data, or deleted tenant accounts), retrying them indefinitely consumes computing resources and clogs the queue.

### The Dead-Letter Queue (DLQ) Lifecycle

1. **Retry Phase:** Jobs fail and are re-enqueued using exponential backoff with full jitter to avoid stampeding downstream APIs:
   $$\text{Delay} = \text{random}(0, \text{base\_delay} \times 2^{\text{attempt}})$$
2. **Exhaustion Phase:** When `job.attemptsMade >= job.opts.attempts`, the worker moves the job to the **Failed Set / Dead-Letter Queue**.
3. **Alerting & Triaging:** Prometheus alerts fire on `bullmq_jobs_failed_total` rate spikes [See Section 13.3]. Operations engineers inspect the payload, patch the root cause, and re-drive the dead-letter queue via administrative CLI commands.

---
