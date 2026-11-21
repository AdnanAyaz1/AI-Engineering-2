# Chapter 5: Database Design, Relational Modeling, and Indexing

## 5.1 Relational Normalization (1NF through BCNF) and Intentional Denormalization

Relational schema design is fundamentally about eliminating update anomalies while optimizing data access pathways. When schemas are improperly modeled, a single logical update requires multiple physical row mutations across different tables, opening windows for data divergence and transaction deadlocks [See Section 6.4].

### Normal Forms Hierarchy

1. **First Normal Form (1NF):** Every column must contain atomic (indivisible) scalar values; duplicate rows are prohibited; a primary key uniquely identifies each record. Storing comma-delimited strings (`"tag1,tag2,tag3"`) violates 1NF.
2. **Second Normal Form (2NF):** Satisfies 1NF, and all non-key attributes are fully functionally dependent on the *entire* primary key, rather than a subset of a composite primary key.
3. **Third Normal Form (3NF):** Satisfies 2NF, and no non-key attribute is transitively dependent on the primary key ($A \to B \to C$). Non-key columns must describe the primary key, the whole primary key, and nothing but the primary key.
4. **Boyce-Codd Normal Form (BCNF):** A stricter version of 3NF where every determinant (a column or set of columns on which another column is fully functionally dependent) must be a candidate key.

### The Strategy of Intentional Denormalization

While high normalization (3NF/BCNF) is mandatory for OLTP write models to guarantee structural integrity, reading deeply nested, highly normalized schemas requires expensive multi-table joins. In read-heavy contexts (such as customer storefronts or billing summaries), architects intentionally denormalize specific columns (e.g., caching `customer_name` directly inside the `orders` table) under strict constraints:
- The denormalized column changes infrequently (low mutation velocity).
- Updates are synchronized either within a single database transaction or via an automated Change Data Capture (CDC) outbox pipeline [See Section 8.4].

---

## 5.2 PostgreSQL Index Structures: B-Trees, GIN, GiST, BRIN, and Hash Indexes

An index is a specialized physical data structure maintained alongside a table to accelerate data retrieval at the cost of write overhead and storage consumption. Selecting the incorrect index type can degrade performance by orders of magnitude.

### PostgreSQL Index Types Comparison Matrix

| Index Type | Internal Data Structure | Best Suited Data Types | Optimal Query Operators | Performance Characteristics |
| :--- | :--- | :--- | :--- | :--- |
| **B-Tree (Default)** | Self-balancing multi-way search tree. | Scalars: Integers, UUIDs, Timestamps, Text. | `=`, `<`, `<=`, `>`, `>=`, `BETWEEN`, `IN`, `IS NULL`, `ORDER BY`. | Logarithmic search $O(\log N)$; supports range scans and sorting. |
| **GIN (Generalized Inverted Index)** | Inverted index mapping internal components to row IDs. | Composite: Arrays, JSONB documents, Full-Text (`tsvector`). | `@>`, `?`, `?&`, `?\|`, `@@` (full-text match). | Fast multi-key lookups; slower write/update latency due to posting tree maintenance. |
| **GiST (Generalized Search Tree)** | Balanced tree representing arbitrary geometric/hierarchical data. | Geometric shapes, IP ranges (`inet`), Temporal ranges (`tsrange`). | `&&` (overlap), `@>` (contains), `<@` (contained within). | Enables nearest-neighbor spatial queries; larger memory footprint than B-tree. |
| **BRIN (Block Range Index)** | Stores minimum and maximum values for physical table block ranges. | Monotonically increasing timeseries data, sequential audit logs. | `<`, `<=`, `=`, `>=`, `>` on physically sorted data. | Tiny footprint (< 1% of B-Tree size); requires append-only physical ordering. |
| **Hash Index** | On-disk hash bucket table. | Arbitrary scalar values. | `=` (strictly equality matches only). | Fast equality lookups; cannot assist range queries or ordering. |

```sql
-- Creating GIN and BRIN indexes in PostgreSQL
-- 1. GIN index for high-performance JSONB document querying
CREATE INDEX idx_audit_logs_metadata_gin 
ON audit_logs USING gin (metadata jsonb_path_ops);

-- Query leveraging the GIN index
SELECT * FROM audit_logs 
WHERE metadata @> '{"event": "AUTH_FAILURE", "geo": {"country": "DE"}}';

-- 2. BRIN index for a 500-million row append-only telemetry table
CREATE INDEX idx_telemetry_recorded_at_brin 
ON device_telemetry USING brin (recorded_at) 
WITH (pages_per_range = 128);
```

---

## 5.3 Composite Index Strategy: Column Ordering, Covering Indexes, and Partial Predicates

### The Left-to-Right Column Ordering Rule

When constructing a composite B-tree index on multiple columns `(col_a, col_b, col_c)`, PostgreSQL orders tuples first by `col_a`, then by `col_b`, and finally by `col_c`. The query planner can leverage this index only if the query's `WHERE` clause filters by a leading prefix of the indexed columns:

- Query: `WHERE col_a = 5 AND col_b = 10` $\to$ **Index Scan** (Uses both columns).
- Query: `WHERE col_a = 5` $\to$ **Index Scan** (Uses `col_a`).
- Query: `WHERE col_b = 10 AND col_c = 20` $\to$ **Cannot use index** (Leading column `col_a` omitted; planner resorts to Sequential Scan).

> [!IMPORTANT]
> **The Equality First, Range Second Rule:** Always place columns tested for exact equality (`=`) first in the composite index definition, followed by columns subjected to range filters (`<`, `>`, `BETWEEN`) or `ORDER BY`.

### Covering Indexes: Index-Only Scans with the `INCLUDE` Clause

In a standard index scan, the engine traverses the index tree to locate matching tuples, retrieves the physical row pointer (`ctid`), and performs a random I/O read against the main table heap to fetch unindexed columns.

A **Covering Index** includes non-search columns in the leaf pages of the index using the `INCLUDE` clause. This allows PostgreSQL to execute an **Index-Only Scan**, returning query results entirely from the index cache without touching the table heap:

```sql
-- Standard Composite Index: Every column must be stored in tree branch nodes
CREATE INDEX idx_users_org_role ON users (organization_id, role);

-- High-Performance Covering Index: email is only stored in leaf pages
CREATE INDEX idx_users_org_role_covering 
ON users (organization_id, role) 
INCLUDE (email, full_name);

-- This query executes as an Index-Only Scan (Heap Fetches: 0)
SELECT email, full_name 
FROM users 
WHERE organization_id = 'org_9921' AND role = 'ADMIN';
```

### Partial Indexes for High-Skew Workloads

If a table contains 10,000,000 rows where 9,900,000 have `status = 'PROCESSED'` and 100,000 have `status = 'PENDING'`, indexing the entire column wastes gigabytes of RAM. A **Partial Index** filters rows at index creation time:

```sql
-- Indexes only unprocessed tasks (1% of table volume)
CREATE INDEX idx_tasks_pending_priority 
ON tasks (priority, scheduled_at) 
WHERE status = 'PENDING';
```

---

## 5.4 Query Execution Plan Analysis: Deconstructing `EXPLAIN (ANALYZE, BUFFERS)`

The database query planner is an optimizer that evaluates statistical cost models to determine whether to execute sequential scans, index scans, or bitmap scans. Enterprise engineers must analyze execution plans using `EXPLAIN (ANALYZE, BUFFERS, VERBOSE)`:

```sql
EXPLAIN (ANALYZE, BUFFERS, VERBOSE)
SELECT u.id, u.email, count(o.id) as order_count
FROM users u
JOIN orders o ON o.user_id = u.id
WHERE u.organization_id = 'org_881'
  AND o.created_at >= '2026-01-01 00:00:00'
GROUP BY u.id, u.email;
```

### Deconstructing the Output Tree

```
HashAggregate  (cost=1240.50..1242.50 rows=200 width=48) (actual time=14.210..14.280 rows=180 loops=1)
  Group Key: u.id, u.email
  Buffers: shared hit=452 read=12
  ->  Nested Loop  (cost=4.82..1235.00 rows=1100 width=40) (actual time=0.082..11.450 rows=1250 loops=1)
        Buffers: shared hit=452 read=12
        ->  Bitmap Heap Scan on users u  (cost=4.30..80.50 rows=50 width=36) (actual time=0.045..0.120 rows=48 loops=1)
              Recheck Cond: (u.organization_id = 'org_881'::text)
              Buffers: shared hit=4
              ->  Bitmap Index Scan on idx_users_org  (cost=0.00..4.29 rows=50 width=0) (actual time=0.025..0.025 rows=48 loops=1)
                    Index Cond: (u.organization_id = 'org_881'::text)
                    Buffers: shared hit=2
        ->  Index Scan using idx_orders_user_created on orders o  (cost=0.52..23.05 rows=22 width=20) (actual time=0.020..0.210 rows=26 loops=48)
              Index Cond: ((o.user_id = u.id) AND (o.created_at >= '2026-01-01 00:00:00'::timestamp))
              Buffers: shared hit=448 read=12
Planning Time: 0.450 ms
Execution Time: 14.510 ms
```

### Key Diagnostic Indicators

1. **`Buffers: shared hit=X read=Y`:** `hit` indicates blocks retrieved directly from PostgreSQL shared buffers (RAM); `read` indicates physical NVMe disk reads. High disk reads under steady-state indicate insufficient shared buffer memory or missing indexes.
2. **`loops=N`:** When a node has `loops=48`, the actual execution time displayed must be multiplied by 48 to compute total elapsed time.
3. **Cost vs. Actual Rows Discrepancy:** If the planner estimated `rows=5` but actual rows returned `rows=500000`, database table statistics are stale. Run `ANALYZE tablename;` to regenerate catalog statistics.

---

## 5.5 Zero-Downtime Schema Evolutions: The Expand-Contract Migration Pattern

In modern CI/CD pipelines, database migrations must execute while the live application fleet is actively servicing user writes. Executing destructive DDL commands (`ALTER TABLE ... ALTER COLUMN ...`) takes exclusive table locks (`AccessExclusiveLock`), which block all concurrent reads and writes, bringing down production.

### The Expand-Contract (Parallel Run) Migration Pattern

To rename a column, alter a column type, or split a table without downtime, follow the four-phase Expand-Contract cycle:

```
[ Phase 1: Expand ]       -> Add new column as nullable; maintain old column.
[ Phase 2: Dual Write ]   -> Application writes to both old and new columns; reads from old.
[ Phase 3: Backfill ]     -> Historical batch backfill script populates new column for older rows.
[ Phase 4: Shift Read ]   -> Application switches read path to new column; continues dual write.
[ Phase 5: Contract ]     -> Application drops write to old column; drop old column via DDL.
```

```sql
-- Zero-Downtime Index Creation in PostgreSQL
-- Standard CREATE INDEX blocks all concurrent INSERT, UPDATE, and DELETE operations.
-- CONCURRENTLY builds the index without acquiring an AccessExclusiveLock.
CREATE INDEX CONCURRENTLY idx_transactions_customer_id 
ON transactions (customer_id);

-- Safe Column Addition with Default Value (PostgreSQL 11+)
-- Adding a column with a constant default no longer rewrites the physical table heap.
ALTER TABLE customers 
ADD COLUMN loyalty_tier VARCHAR(32) DEFAULT 'STANDARD' NOT NULL;
```

---
