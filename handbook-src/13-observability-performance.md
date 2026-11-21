# Chapter 13: Observability, Telemetry, and Performance Engineering

## 13.1 The Three Telemetry Pillars: Correlating Metrics, Distributed Traces, and Structured Logs

In complex microservices topologies, understanding system health requires moving beyond naive uptime pings. Modern observability unifies three distinct telemetry signals:

```
                          [ UNIFIED OBSERVABILITY ]
                                     │
           ┌─────────────────────────┼─────────────────────────┐
           │                         │                         │
           ▼                         ▼                         ▼
      [ METRICS ]               [ TRACES ]                 [ LOGS ]
  "Something is wrong"    "Where is it happening?"    "Why is it happening?"
 (Prometheus / Datadog)       (OpenTelemetry)         (Loki / Elasticsearch)
  Aggregated time-series   Distributed transaction     High-context discrete
   counters & histograms    spans across services       event records with PII
```

### The Correlation Triad

The true power of observability emerges when all three pillars are correlated via a single identifier: **The Trace ID**. 
- A Prometheus latency alert fires for `/v1/checkout`.
- The engineer clicks the metric graph, navigating directly into an OpenTelemetry distributed trace representing the 99th percentile latency spike.
- From the trace span, the engineer clicks directly into the structured JSON logs emitted by that exact execution thread using the unified `trace_id` and `span_id`.

---

## 13.2 Distributed Tracing with OpenTelemetry: Trace Context Propagation and Span Semantic Conventions

When a user clicks "Submit Order", the transaction may traverse an Edge Cloudflare Worker, an Ingress NGINX proxy, an API Gateway, an Orders Service, an Inventory Service, and a PostgreSQL database.

### W3C Trace Context Standard (`traceparent`)

To track the request across process boundaries, services propagate the standardized **W3C `traceparent` HTTP header**:

```
traceparent: 00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01
             ── ──────────────────────────────── ──────────────── ──
             │                 │                        │          │
         Version           Trace ID                  Span ID     Trace Flags
          (00)         (16-byte hex)               (8-byte hex)  (01 = Sampled)
```

### Production OpenTelemetry Node.js SDK Initialization

```typescript
// instrumentation.ts - Must be loaded before any other application modules!
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

const traceExporter = new OTLPTraceExporter({
  url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT ?? 'http://otel-collector.monitoring:4317'
});

export const otelSdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'core-orders-api',
    [SemanticResourceAttributes.SERVICE_VERSION]: '4.2.0',
    [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV ?? 'production'
  }),
  traceExporter,
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-fs': { enabled: false }, // Disable high-volume disk spans
      '@opentelemetry/instrumentation-http': {
        ignoreIncomingRequestHook: (req) => req.url === '/health/liveness' || req.url === '/metrics'
      }
    })
  ]
});

otelSdk.start();
```

---

## 13.3 Metrics Instrumentation: Prometheus Metric Types, Percentiles (p50/p95/p99), and PromQL Analysis

Metrics are numerically aggregated values monitored over time with negligible CPU and network overhead.

### Prometheus Metric Types

| Metric Type | Behavior | Best Use Case |
| :--- | :--- | :--- |
| **Counter** | Cumulative metric that strictly increases or resets to zero upon restart. | Request counts (`http_requests_total`), error counts, completed tasks. |
| **Gauge** | Value that can arbitrarily increase or decrease. | Memory usage (`process_resident_memory_bytes`), active connections, queue depth. |
| **Histogram** | Samples observations (usually request durations) and counts them in configurable buckets. | Request latencies, payload sizes, database query times. |
| **Summary** | Calculates configurable quantiles (e.g. $\phi = 0.99$) over a sliding time window. | Client-side quantile tracking when raw aggregation across nodes is not needed. |

### The Fallacy of Averages vs. Percentiles

Engineering teams frequently make the catastrophic mistake of monitoring average response times. An average hides critical tail latency: if 99 users experience a 10ms response and 1 user experiences a 10,000ms timeout, the average response time appears healthy at 109ms.

Always measure and alert on percentiles:
- **p50 (Median):** 50% of requests are faster than this value. Represents typical user experience.
- **p95:** 95% of requests are faster. Identifies systemic degradation.
- **p99:** Tail latency. Captures garbage collection pauses, lock contention, and network drops.

### Express Request Duration Histogram Middleware

```typescript
import client from 'prom-client';
import type { Request, Response, NextFunction } from 'express';

// Define standardized Prometheus Histogram for HTTP Latency
export const httpRequestDurationMicroseconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds across routes',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10] // Tailored latency buckets
});

export function prometheusMetricsMiddleware(req: Request, res: Response, next: NextFunction): void {
  const start = process.hrtime();

  res.on('finish', () => {
    const diff = process.hrtime(start);
    const durationSeconds = diff[0] + diff[1] / 1e9;
    const route = req.route?.path ?? req.path;

    httpRequestDurationMicroseconds.observe(
      {
        method: req.method,
        route,
        status_code: res.statusCode.toString()
      },
      durationSeconds
    );
  });

  next();
}
```

### Essential PromQL Alerting Queries

```promql
# 1. 99th Percentile Latency over 5-minute sliding window
histogram_quantile(0.99, sum(rate(http_request_duration_seconds_bucket[5m])) by (le, route)) > 0.5

# 2. Percentage of 5xx server errors over total traffic
sum(rate(http_requests_total{status_code=~"5.."}[5m])) 
  / 
sum(rate(http_requests_total[5m])) * 100 > 1.0
```

---

## 13.4 Structured JSON Logging: Contextual Metadata, Cardinality Traps, and PII Masking Filters

Unstructured plaintext logs (`console.log("User logged in: " + userId)`) are un-indexable at enterprise scale. Systems emitting millions of logs per second must emit single-line, standardized **Structured JSON** documents.

### The High-Cardinality Trap

A critical mistake in telemetry instrumentation is injecting high-cardinality values (e.g. UUIDs, email addresses, credit card numbers) into Prometheus metric labels. Because Prometheus creates an independent time-series for every unique label combination, assigning `userId` as a metric label triggers a **cardinality explosion**, exhausting cluster RAM and crashing the metrics server.

**Rule:** High-cardinality attributes belong strictly in **Structured Logs and Distributed Traces**, never in Metric Labels!

---

## 13.5 Service Level Engineering: Defining SLIs, SLO Targets, Error Budgets, and Burn-Rate Alerts

Site Reliability Engineering (SRE) manages reliability through mathematical service level contracts:

- **Service Level Indicator (SLI):** A quantifiable metric of performance (e.g., the proportion of valid HTTP requests returning HTTP status $< 500$ within $\le 200\text{ms}$).
- **Service Level Objective (SLO):** The target reliability agreed upon with business stakeholders (e.g., $99.9\%$ over a 30-day rolling window).
- **Service Level Agreement (SLA):** A legal contract with financial penalties for failing to meet the SLO.

### The Mathematics of the Error Budget

The **Error Budget** is the allowable unreliability threshold:
$$\text{Error Budget} = 100\% - \text{SLO}$$

For a $99.9\%$ SLO over a 30-day period:
$$\text{Allowed Downtime} = 30 \times 24 \times 60 \times (1 - 0.999) = 43.2 \text{ minutes}$$

### Multi-Window Multi-Burn-Rate Alerting

Legacy threshold alerts (alerting whenever error rate exceeds 1%) trigger noisy alerts on brief transient spikes. Google SRE prescribes **Burn-Rate Alerting**, which alerts based on how rapidly the service is consuming its allowable monthly error budget:

| Burn Rate | Budget Consumed | Alert Notification | Page On-Call Engineer? |
| :--- | :--- | :--- | :--- |
| **$14.4\times$** | $2\%$ in 1 hour | Immediate PagerDuty Page | **Yes (Critical Emergency)** |
| **$6.0\times$** | $5\%$ in 6 hours | PagerDuty Page within 15m | **Yes** |
| **$1.0\times$** | $100\%$ over 30 days | Jira Ticket / Slack Channel | No (Triage during office hours) |

---
