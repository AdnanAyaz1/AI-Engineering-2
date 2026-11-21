# Chapter 11: Docker, CI/CD, and Container Orchestration

## 11.1 Container Hardening: Multi-Stage Minimal Builds, Non-Root Execution, and Image Scanning

In enterprise production environments, shipping bloated, root-privileged container images to Kubernetes clusters introduces severe security vulnerabilities and slow deployment cold starts. A standard single-stage `node:latest` image exceeds 1.2 gigabytes in size, containing package managers (`npm`, `yarn`), compiler toolchains (`gcc`, `python`), shell binaries (`bash`, `sh`), and operating system packages with dozens of unpatched CVEs.

### Multi-Stage Dockerfile Pattern for Next.js and Node.js

Multi-stage builds decouple the build environment (which requires compilers, TypeScript, and developer dependencies) from the final runtime container. The runtime container ships *only* compiled JavaScript artifacts, production dependencies, and a stripped minimal Linux base:

```dockerfile
# syntax=docker/dockerfile:1.4
# ==============================================================================
# STAGE 1: Dependency Resolution
# ==============================================================================
FROM node:24-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy lockfiles first to maximize layer caching efficiency
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

# ==============================================================================
# STAGE 2: Application Compilation
# ==============================================================================
FROM node:24-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build Next.js application in standalone mode
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN npm run build

# ==============================================================================
# STAGE 3: Minimal Hardened Production Runtime
# ==============================================================================
FROM node:24-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Enforce Non-Root Execution: Principle of Least Privilege
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy only necessary runtime artifacts from builder
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Drop root privileges
USER nextjs

EXPOSE 3000

# Leverage node executable directly without intermediate shell wrapping
CMD ["node", "server.js"]
```

> [!IMPORTANT]
> **Container Hardening Invariants:**
> 1. **Never run as root:** Always declare an explicit non-root user (`USER nextjs` or `USER 1001`). If an attacker escapes a Node.js process running as root, they gain kernel root capabilities on the host node.
> 2. **Enforce Read-Only Root Filesystem:** In Kubernetes `securityContext`, set `readOnlyRootFilesystem: true`. Malicious binaries cannot be downloaded or executed in `/tmp` or `/app`.
> 3. **Static Image Scanning:** Integrate Trivy or Snyk in CI pipelines; block deployment if images contain `HIGH` or `CRITICAL` severity CVEs.

---

## 11.2 Kubernetes Workload Topologies: Deployments, StatefulSets, Services, and Ingress

Kubernetes abstracts physical cloud hardware into dynamic pools of compute, networking, and storage resources.

### Workload Abstractions

- **Deployments:** Manage stateless application replicas (e.g. Next.js frontends, Express API microservices). Deployments facilitate rolling zero-downtime updates and autoscaling via Horizontal Pod Autoscalers (HPA).
- **StatefulSets:** Manage stateful workloads requiring stable, unique network identifiers (e.g. `redis-0`, `redis-1`), dedicated persistent volume attachments, and ordered ordinal scaling. Used for distributed datastores, Kafka brokers, and Elasticsearch clusters.
- **DaemonSets:** Ensure that an exact copy of a pod runs across every single worker node in the cluster. Used for cluster-wide logging agents (FluentBit, Promtail) and node monitoring daemons (Datadog, Node Exporter).

---

## 11.3 Container Health Probes: Startup, Liveness, and Readiness Configurations

Misconfiguring Kubernetes health probes is the single most common cause of self-inflicted cascading outages. When a pod experiences a transient latency spike, an aggressive liveness probe terminates the container. The traffic immediately shifts to the remaining pods, overloading them and triggering a cluster-wide restart loop.

### The Three Health Probes

```
Container Lifecycle:
[ Container Start ] ──► [ Startup Probe ] (Polls until app finishes initializing)
                                │ (Succeeds)
                                ▼
                        [ Readiness Probe ] ◄── Controls traffic ingestion via kube-proxy
                        [ Liveness Probe  ] ◄── Controls container restart lifecycle
```

1. **Startup Probe:** Evaluates whether slow application bootstrap processes (loading deep learning models, parsing vector embeddings, executing database migrations) have completed. Liveness and Readiness probes are completely suppressed until the Startup probe succeeds.
2. **Readiness Probe:** Controls whether the pod receives incoming network traffic from Kubernetes Services. If the readiness probe returns HTTP 503 (e.g., local database connection pool is full), Kubernetes removes the pod from the Service endpoint list. **It does NOT restart the container.**
3. **Liveness Probe:** Evaluates whether the process has deadlocked (e.g., event loop starvation [See Section 3.1]). If this probe fails, the kubelet kills the container and initiates a restart.

```yaml
# Production Kubernetes Deployment Manifest (deployment.yaml)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: core-api-service
  namespace: production
  labels:
    app.kubernetes.io/name: core-api-service
    app.kubernetes.io/version: "4.2.0"
spec:
  replicas: 5
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 25%
      maxUnavailable: 0 # Never reduce capacity during rollouts
  selector:
    matchLabels:
      app: core-api-service
  template:
    metadata:
      labels:
        app: core-api-service
    spec:
      securityContext:
        runAsNonRoot: true
        runAsUser: 1001
        runAsGroup: 1001
        fsGroup: 1001
      containers:
        - name: app
          image: registry.enterprise.internal/services/core-api:v4.2.0
          imagePullPolicy: IfNotPresent
          securityContext:
            readOnlyRootFilesystem: true
            allowPrivilegeEscalation: false
            capabilities:
              drop: ["ALL"]
          resources:
            requests:
              cpu: "500m"
              memory: "512Mi"
            limits:
              cpu: "2000m"
              memory: "1536Mi"
          ports:
            - containerPort: 3000
              name: http
          startupProbe:
            httpGet:
              path: /health/startup
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 5
            failureThreshold: 12 # Gives app up to 60s to bootstrap
          readinessProbe:
            httpGet:
              path: /health/readiness
              port: 3000
            periodSeconds: 5
            timeoutSeconds: 2
            successThreshold: 1
            failureThreshold: 3
          livenessProbe:
            httpGet:
              path: /health/liveness
              port: 3000
            periodSeconds: 10
            timeoutSeconds: 3
            failureThreshold: 5
```

---

## 11.4 Enterprise CI/CD Pipeline Topologies: Test Parallelism, Artifact Promotion, and Security Gates

A world-class CI/CD pipeline guarantees two orthogonal objectives: **high developer velocity** (providing fast test feedback within 5 minutes) and **absolute production safety** (preventing defective or vulnerable code from landing in production).

### Pipeline Stage Architecture

```
[ Git Push to Feature Branch ]
       │
       ▼
┌────────────────────────────────────────────────────────────────────────┐
│ STAGE 1: Parallel Fast Checks (Target: < 3 minutes)                   │
│   ├── ESLint / Prettier Syntax Linting                                │
│   ├── TypeScript Typecheck (`tsc --noEmit`)                            │
│   ├── Gitleaks Secret Scanning (Detects committed API keys)           │
│   └── Unit Test Matrix (Jest / Vitest with 8-way sharding)            │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│ STAGE 2: Hermetic Integration Tests (Target: < 6 minutes)              │
│   ├── Spin up ephemeral PostgreSQL & Redis via Testcontainers          │
│   └── API Integration Suite with Database Schema Migrations           │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │ (Merge to main)
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│ STAGE 3: Build & Security Audit                                        │
│   ├── Multi-stage Docker Build (BuildKit with remote cache)            │
│   ├── Trivy Image Vulnerability Scanning                               │
│   └── Cosign Cryptographic Artifact Signing                            │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│ STAGE 4: Automated Canary Rollout in Production                        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 11.5 Modern Progressive Delivery: Blue-Green Switches, Canary Deployments, and Automated Rollbacks

Deploying new software must never be an all-or-nothing roll of the dice. Progressive delivery techniques limit the blast radius of unexpected defects:

### Progressive Delivery Comparison

| Deployment Strategy | Traffic Routing Mechanism | Resource Overhead | Rollback Latency | Risk Exposure |
| :--- | :--- | :--- | :--- | :--- |
| **Rolling Update** | Pods replaced incrementally (e.g. 1 by 1) behind standard Kubernetes Service. | Zero additional infrastructure cost. | Moderate (requires reversing rolling update: 2–5 minutes). | High; bad code immediately impacts a percentage of all live users. |
| **Blue-Green** | Two identical production fleets (Blue=Active, Green=New). Router flips 100% traffic instantly. | **100% duplicate infrastructure** required during cutover. | **Near-zero** (instant router switch back to Blue: < 2 seconds). | Low; complete pre-warm verification possible before cutover. |
| **Canary Deployment** | Fine-grained traffic splitting (e.g. 1% $\to$ 5% $\to$ 25% $\to$ 100%) via Service Mesh (Istio / Argo). | Low (only canary pod instances duplicated). | Fast (drop traffic percentage to 0% upon anomaly detection). | **Minimal**; defects impact only a tiny subset of users before auto-rollback. |

### Automated Canary Metric Analysis

In modern progressive delivery (e.g. Argo Rollouts), traffic advancement is governed by automated metric analysis:
- Query Prometheus: `sum(rate(http_requests_total{status=~"5.*", app="core-api-canary"}[2m])) / sum(rate(http_requests_total{app="core-api-canary"}[2m]))`
- If HTTP 5xx error rate exceeds $0.5\%$ or p99 latency exceeds $250\text{ms}$ during the 10-minute evaluation window, Argo automatically halts the rollout, sets canary traffic weight to $0\%$, and pages the on-call engineer [See Section 14.4].

---
