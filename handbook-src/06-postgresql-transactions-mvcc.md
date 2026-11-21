# Chapter 6: PostgreSQL Transactions, Concurrency, and MVCC

## 6.1 ACID Guarantees and ANSI SQL vs. PostgreSQL Isolation Realities

Relational database systems guarantee consistency through the mathematical framework of ACID:
- **Atomicity:** All statements within a transaction succeed, or the entire transaction is rolled back with zero partial state mutations.
- **Consistency:** Transactions transition the database from one valid state satisfying all schema constraints (foreign keys, uniqueness, check expressions) to another.
- **Isolation:** Concurrent transactions execute without mutual interference.
- **Durability:** Once committed, transaction writes survive operating system crashes, hardware failures, and power loss.

### ANSI SQL vs. PostgreSQL Isolation Realities

The ANSI SQL-92 standard defines four isolation levels characterized by three specific phenomena: Dirty Reads, Non-Repeatable Reads, and Phantom Reads. However, the ANSI definition is fundamentally flawed because it fails to capture modern Multi-Version Concurrency Control (MVCC) engines and anomalies like **Write Skew**.

In PostgreSQL, the actual isolation behavior differs markedly from the ANSI standard:

| Isolation Level | Dirty Read | Non-Repeatable Read | Phantom Read | Serialization Anomaly (Write Skew) |
| :--- | :--- | :--- | :--- | :--- |
| **Read Committed (PostgreSQL Default)** | **Not Possible** | Possible | Possible | Possible |
| **Repeatable Read** | **Not Possible** | **Not Possible** | **Not Possible** (in Postgres) | Possible |
| **Serializable (SSI)** | **Not Possible** | **Not Possible** | **Not Possible** | **Not Possible** |

> [!NOTE]
> In PostgreSQL, `Read Uncommitted` is treated identically to `Read Committed`. PostgreSQL's storage architecture never permits dirty reads under any configuration because uncommitted tuple states are invisible to concurrent transactions.

---

## 6.2 Multi-Version Concurrency Control (MVCC): Tuple Headers, Vacuuming, and Bloat Mitigation

The core design principle of PostgreSQL MVCC is: *"Readers never block writers, and writers never block readers."* When an `UPDATE` statement modifies a row, PostgreSQL does not overwrite the physical data on disk. Instead, it marks the existing row version as expired and inserts an entirely new physical row version (a new "tuple") into the table heap.

### Physical Tuple Header Architecture

Every row tuple stored on disk contains an internal 23-byte header comprising several critical transaction visibility fields:
- `xmin`: The Transaction ID (XID) of the inserting transaction.
- `xmax`: The Transaction ID (XID) of the deleting or updating transaction. For live active rows, `xmax` is 0.
- `t_ctid`: A tuple pointer (`(block_number, tuple_offset)`) pointing to the physical location of the row version. If the row has been updated, `t_ctid` points forward to the new version tuple.

```
Initial Insert (XID 501):
Heap Block 1:
┌────────────────────────────────────────────────────────┐
│ [Tuple A1] xmin: 501, xmax: 0, t_ctid: (1, 1)          │
│ Data: { id: 101, balance: $1,000 }                     │
└────────────────────────────────────────────────────────┘

After UPDATE balance = $1,200 (XID 508):
Heap Block 1:
┌────────────────────────────────────────────────────────┐
│ [Tuple A1] (DEAD) xmin: 501, xmax: 508, t_ctid: (1, 2) │
│ Data: { id: 101, balance: $1,000 }                     │
├────────────────────────────────────────────────────────┤
│ [Tuple A2] (LIVE) xmin: 508, xmax: 0, t_ctid: (1, 2)   │
│ Data: { id: 101, balance: $1,200 }                     │
└────────────────────────────────────────────────────────┘
```

### Table Bloat and the Vacuum Process

When `xmax` has committed and is older than the oldest running transaction in the database, the old tuple becomes a **dead tuple**. Dead tuples consume disk space and memory buffer cache pages, slowing down sequential and index scans.

The **VACUUM** process scans table blocks, reclaims dead tuple slots, and marks them as available for subsequent inserts. However, standard `VACUUM` *does not return disk space to the operating system*; it merely defragments pages internally. Only `VACUUM FULL` rewrites the entire table to reclaim disk space, but it acquires an exclusive table lock (`AccessExclusiveLock`), halting all production operations.

```ini
# Recommended Enterprise PostgreSQL Autovacuum Tuning (postgresql.conf)
# Aggressive autovacuum parameters to prevent catastrophic table bloat
autovacuum = on
autovacuum_max_workers = 6
autovacuum_naptime = 15s

# Trigger vacuum when 5% of tuples are dead (default 20% is too loose for OLTP)
autovacuum_vacuum_scale_factor = 0.05
autovacuum_vacuum_threshold = 1000

# Increase I/O throughput allocated to the autovacuum cost worker
autovacuum_vacuum_cost_limit = 2000
autovacuum_vacuum_cost_delay = 2ms
```

---

## 6.3 Concurrency Anomalies: Dirty Reads, Non-Repeatable Reads, Phantom Reads, and Write Skew

Understanding concurrency anomalies is vital when configuring financial transaction pipelines:

1. **Non-Repeatable Read (Fuzzy Read):** Transaction A reads a row. Transaction B updates that row and commits. Transaction A re-reads the row and observes the mutated values within the same transaction.
2. **Phantom Read:** Transaction A queries a set of rows satisfying a condition (`WHERE balance > 1000`). Transaction B inserts a new row with `balance = 1500` and commits. Transaction A executes the identical query and sees the newly created "phantom" row.
3. **Write Skew:** Occurs under Repeatable Read when two concurrent transactions read overlapping data sets, evaluate an invariant, make disjoint mutations, and commit—violating the invariant:

```
Scenario: On-Call Doctor Scheduling Invariant: "At least one doctor must remain on call."
Doctors on call: Dr. Alice (true), Dr. Bob (true)

Transaction 1 (Dr. Alice requests off):
  1. SELECT count(*) FROM on_call WHERE status = true; -> Returns 2 (Safe!)
  2. UPDATE on_call SET status = false WHERE doctor = 'Alice';
  3. COMMIT;

Transaction 2 (Dr. Bob requests off - CONCURRENT):
  1. SELECT count(*) FROM on_call WHERE status = true; -> Returns 2 (Safe!)
  2. UPDATE on_call SET status = false WHERE doctor = 'Bob';
  3. COMMIT;

Result: ZERO doctors remain on call! The invariant is completely violated.
```

### Resolving Write Skew with Serializable Snapshot Isolation (SSI)

Under `SERIALIZABLE`, PostgreSQL tracks read-write dependencies using Serializable Snapshot Isolation (SSI). If PostgreSQL detects a dangerous dependency cycle that could violate serializability, it automatically aborts one of the transactions with SQL state `40001 (serialization_failure)`.

Applications utilizing `SERIALIZABLE` transactions must implement an automated retry loop:

```typescript
import { Pool, PoolClient } from 'pg';

export async function executeWithSerializableRetry<T>(
  pool: Pool,
  operation: (client: PoolClient) => Promise<T>,
  maxRetries: number = 5
): Promise<T> {
  let attempts = 0;
  while (true) {
    attempts++;
    const client = await pool.connect();
    try {
      await client.query('BEGIN TRANSACTION ISOLATION LEVEL SERIALIZABLE');
      const result = await operation(client);
      await client.query('COMMIT');
      return result;
    } catch (err: any) {
      await client.query('ROLLBACK');
      
      // SQL State 40001 indicates serialization failure / write skew conflict
      if (err.code === '40001' && attempts < maxRetries) {
        const jitter = Math.floor(Math.random() * 50);
        const backoffMs = Math.pow(2, attempts) * 20 + jitter;
        console.warn(`[SSI Conflict] Serialization collision detected. Retrying attempt ${attempts}/${maxRetries} after ${backoffMs}ms...`);
        await new Promise((r) => setTimeout(r, backoffMs));
        continue;
      }
      throw err;
    } finally {
      client.release();
    }
  }
}
```

---

## 6.4 Explicit Row-Level Locking Patterns: `SELECT FOR UPDATE` vs. `SKIP LOCKED`

When multiple worker nodes consume records from a shared database table, relying on naive application-level checks causes race conditions and duplicate job execution.

### The Queue Processing Anti-Pattern vs. Modern `SKIP LOCKED`

```sql
-- ANTI-PATTERN: Prone to race conditions and deadlocks under concurrent workers
-- Worker 1 and Worker 2 both select the same pending task
SELECT id FROM task_queue WHERE status = 'PENDING' LIMIT 1;
-- Both attempt to update it: one succeeds, one wastes cycles or conflicts
UPDATE task_queue SET status = 'PROCESSING' WHERE id = 101;
```

### High-Throughput Queue Consumer with `SKIP LOCKED`

PostgreSQL 9.5 introduced `SKIP LOCKED`. When a worker executes `SELECT ... FOR UPDATE SKIP LOCKED`, the database locks matching rows and immediately bypasses any rows currently locked by concurrent transactions, preventing worker blocking:

```sql
-- High-Performance Worker Task Claiming
WITH next_task AS (
  SELECT id 
  FROM task_queue
  WHERE status = 'PENDING' 
    AND scheduled_at <= NOW()
  ORDER BY priority DESC, scheduled_at ASC
  LIMIT 1
  FOR UPDATE SKIP LOCKED -- Skips tasks currently locked by other workers!
)
UPDATE task_queue
SET status = 'PROCESSING',
    locked_by = 'worker-node-04a',
    locked_at = NOW()
FROM next_task
WHERE task_queue.id = next_task.id
RETURNING task_queue.id, task_queue.payload, task_queue.priority;
```

---

## 6.5 Write-Ahead Logging (WAL), Checkpoints, and Synchronous vs. Asynchronous Replication

Durability and replication performance in PostgreSQL are governed by the **Write-Ahead Log (WAL)**.

### The WAL Invariant

Before any database page modification (insert, update, delete) is written to the table data files on disk, the change must be appended sequentially to the WAL log on persistent storage and flushed via `fsync`. If the server suddenly loses power, PostgreSQL recovers during startup by replaying WAL records from the last known **Checkpoint** forward to restore structural consistency.

### Replication Topologies Comparison

```
[ Primary Database ] --(WAL Stream)--> [ Replica Node A (Synchronous) ]
          |                                  ^
          |                                  | Client commit waits for ACK!
          +------------(WAL Stream)--------> [ Replica Node B (Asynchronous) ]
                                             | Client commit returns immediately!
```

- **Asynchronous Replication (Default):** The primary commits immediately after writing WAL locally. Replication lag (typically 5ms to 500ms) introduces the risk of data loss if the primary suffers sudden hardware failure before the WAL stream is flushed to the replica.
- **Synchronous Replication (`synchronous_commit = on`):** The primary transaction does not return success to the client until at least one replica confirms that the WAL record has been written to its local memory buffer or disk. This provides zero Recovery Point Objective (RPO=0) at the expense of write latency (adding network roundtrip overhead to every commit).

---
