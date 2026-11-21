# Chapter 15: Cross-Cutting Architectural Runbooks and Troubleshooting Playbooks

## 15.1 Playbook 1: PostgreSQL Connection Pool Starvation and High CPU Triage

### Trigger Symptoms
- PagerDuty alert fires on `pg_pool_active_connections_ratio > 0.95`.
- Microservice pods report `error: timeout acquiring connection from pool (30000ms)`.
- Database server CPU utilization spikes to 100% on primary node.

### Diagnostic Procedure

Execute the following diagnostic query on the primary database via bastion terminal:

```sql
-- 1. Identify active blocking queries and lock contention
SELECT 
  blocked_locks.pid     AS blocked_pid,
  blocked_activity.usename  AS blocked_user,
  blocking_locks.pid    AS blocking_pid,
  blocking_activity.usename AS blocking_user,
  blocked_activity.query    AS blocked_statement,
  blocking_activity.query   AS blocking_statement,
  now() - blocked_activity.query_start AS blocked_duration
FROM  pg_catalog.pg_locks         blocked_locks
JOIN pg_catalog.pg_stat_activity blocked_activity ON blocked_activity.pid = blocked_locks.pid
JOIN pg_catalog.pg_locks         blocking_locks 
    ON blocking_locks.locktype = blocked_locks.locktype
    AND blocking_locks.database IS NOT DISTINCT FROM blocked_locks.database
    AND blocking_locks.relation IS NOT DISTINCT FROM blocked_locks.relation
    AND blocking_locks.page IS NOT DISTINCT FROM blocked_locks.page
    AND blocking_locks.tuple IS NOT DISTINCT FROM blocked_locks.tuple
    AND blocking_locks.virtualxid IS NOT DISTINCT FROM blocked_locks.virtualxid
    AND blocking_locks.transactionid IS NOT DISTINCT FROM blocked_locks.transactionid
    AND blocking_locks.classid IS NOT DISTINCT FROM blocked_locks.classid
    AND blocking_locks.objid IS NOT DISTINCT FROM blocked_locks.objid
    AND blocking_locks.objsubid IS NOT DISTINCT FROM blocked_locks.objsubid
    AND blocking_locks.pid != blocked_locks.pid
JOIN pg_catalog.pg_stat_activity blocking_activity ON blocking_activity.pid = blocking_locks.pid
WHERE NOT blocked_locks.granted;

-- 2. Inspect long-running statements consuming high CPU
SELECT pid, now() - query_start AS duration, state, query 
FROM pg_stat_activity 
WHERE state != 'idle' 
ORDER BY duration DESC 
LIMIT 10;
```

### Remediation Steps
1. **Terminate the Root Blocking PID:**
   ```sql
   -- Graceful cancellation
   SELECT pg_cancel_backend(<blocking_pid>);
   -- If unyielding after 10s, execute forced termination
   SELECT pg_terminate_backend(<blocking_pid>);
   ```
2. **Deploy PgBouncer / Connection Pool Throttle:** Ensure microservices connect through PgBouncer in transaction pooling mode rather than establishing raw direct sessions [See Section 5.3].
3. **Analyze Index Gaps:** If a long-running sequential scan caused the spike, identify missing composite indexes [See Section 5.3] and schedule a `CREATE INDEX CONCURRENTLY` deployment.

---

## 15.2 Playbook 2: Redis Memory Eviction Spikes and Cache Stampede Recovery

### Trigger Symptoms
- Prometheus metric `redis_evicted_keys_total` spikes by $> 1000\%$.
- Application p99 response times increase from 15ms to 1,200ms.
- Downstream PostgreSQL CPU jumps as cache hit ratio drops from 98% to 40%.

### Diagnostic Procedure

```bash
# Connect to Redis CLI via telemetry pod
redis-cli -h redis-primary.internal.net -p 6379 -a "$REDIS_AUTH"

# 1. Check current memory utilization and fragmentation ratio
INFO memory

# 2. Inspect hot keys consuming disproportionate memory
redis-cli --bigkeys

# 3. Check current eviction policy
CONFIG GET maxmemory-policy
```

### Remediation Steps
1. **Verify Eviction Policy:** Ensure `maxmemory-policy` is set to `volatile-lru` or `allkeys-lru` rather than `noeviction` (which throws out-of-memory errors on writes).
2. **Mitigate Active Stampede:** If a critical key expired, manually populate the key with a temporary synthetic value and a 4-hour jittered TTL to relieve database query pressure immediately [See Section 7.2].
3. **Implement Distributed Mutex:** Update application code to wrap database queries in a single-flight distributed lock or XFetch probabilistic algorithm before repopulating cold cache keys [See Section 7.3].

---

## 15.3 Playbook 3: RAG Retrieval Quality Degradation and Hallucination Spikes

### Trigger Symptoms
- Automated evaluation pipeline reports Faithfulness / Groundedness score dropping below $0.75$.
- Customer tickets report that the AI assistant answers with outdated policies or claims ignorance on indexed corporate documents.

### Diagnostic Procedure

```
Retrieval Triage Checklist:
[ ] 1. Document Extraction Audit: Verify raw extracted text from source PDFs. Did layout parsing scramble table columns? [See Section 10.1]
[ ] 2. Embedding Drift: Has the embedding model version been silently updated (e.g., text-embedding-3-small vs ada-002) without re-indexing the corpus?
[ ] 3. Vector Similarity Threshold: Is the cosine similarity filter cutoff too aggressive (e.g. min_score > 0.85 discarding valid technical chunks)?
[ ] 4. Hybrid Search Balance: Are dense vectors failing on specific technical SKUs or error codes? [See Section 9.4]
```

### Remediation Steps
1. **Verify Vector Dimension Consistency:** Run SQL sanity check:
   ```sql
   SELECT count(*) FROM document_chunks 
   WHERE embedding IS NULL OR array_length(embedding, 1) != 1536;
   ```
2. **Switch to Hybrid Search (RRF):** Enable Reciprocal Rank Fusion combining full-text BM25 search with vector similarity [See Section 9.4].
3. **Tune Chunk Overlap:** If facts are split across chunk boundaries, re-index with 15% sliding window overlap using `RecursiveCharacterTextSplitter` [See Section 10.2].

---

## 15.4 Playbook 4: Kubernetes CrashLoopBackOff and Out-Of-Memory (OOMKilled) Diagnostics

### Trigger Symptoms
- `kubectl get pods` shows pod status `CrashLoopBackOff` or `Error`.
- Pod termination reason indicates `OOMKilled` (Exit Code 137).

### Diagnostic Procedure

```bash
# 1. Inspect pod events and termination metadata
kubectl describe pod core-api-service-7f89d4b6-x8k2q -n production

# Look for:
# Last State:     Terminated
#   Reason:       OOMKilled
#   Exit Code:    137

# 2. Check preceding container logs before crash
kubectl logs core-api-service-7f89d4b6-x8k2q -n production --previous --tail=100

# 3. Inspect node memory pressure
kubectl top nodes
kubectl top pods -n production --sort-by=memory
```

### Remediation Steps
1. **Analyze Node.js Max Old Space:** If container memory limit is `1536Mi`, ensure Node.js is configured with `--max-old-space-size=1200` to trigger garbage collection *before* the Linux cgroup terminates the process with SIGKILL:
   ```yaml
   env:
     - name: NODE_OPTIONS
       value: "--max-old-space-size=1200"
   ```
2. **Profile Stream Pipelines:** Verify whether recent commits introduced unbounded `fs.readFile()` or un-streamed exports [See Section 3.2].
3. **Adjust Memory Limits:** Temporarily increase Kubernetes `resources.limits.memory` in the deployment manifest while taking heap snapshots to diagnose root cause memory leaks [See Section 3.5].

---

## 15.5 Playbook 5: Event-Driven Kafka Consumer Lag and Poison Pill Message Remediation

### Trigger Symptoms
- Consumer group lag metric `kafka_consumergroup_lag` grows exponentially.
- Processing latency for downstream events exceeds 45 minutes.

### Diagnostic Procedure

```bash
# 1. Inspect consumer group lag across topic partitions
kafka-consumer-groups.sh \
  --bootstrap-server kafka-broker.internal:9092 \
  --describe --group billing-invoicing-group

# Identify specific partition where CURRENT-OFFSET is stuck while LOG-END-OFFSET increases!
```

### Remediation Steps
1. **Detect Poison Pill Message:** A "poison pill" is a malformed message whose schema crashes the consumer worker immediately upon deserialization, causing the worker to crash, restart, and re-read the identical poison message in an infinite loop.
2. **Route Poison Pill to Dead-Letter Queue (DLQ):** Update the consumer to wrap JSON parsing in a `try/catch` block that forwards corrupted payloads directly to the topic's dead-letter queue (`orders.DLQ`) rather than throwing an unhandled rejection [See Section 7.5].
3. **Scale Consumer Partitions:** If lag is caused by legitimate volume, scale the consumer pod replica count up to the total partition count (a consumer group cannot have more active consumers than topic partitions).

---
