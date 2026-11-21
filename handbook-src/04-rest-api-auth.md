# Chapter 4: REST API Design, Protocols, and Authentication

## 4.1 Pragmatic REST Resource Modeling, HTTP Semantics, and Error Contracts

The architectural value of Representational State Transfer (REST) lies in establishing uniform, self-describing interfaces that decouple client implementations from backend evolving topologies. When designed pragmatically, REST APIs minimize developer cognitive load and maximize HTTP intermediary cacheability (via forward proxies and CDNs).

### HTTP Verb Semantics and Idempotency Guarantees

Every HTTP method conveys strict semantic guarantees regarding **Safety** (whether the method produces side effects on the server) and **Idempotency** (whether executing the request $N$ times yields the identical state as executing it once):

| HTTP Method | Safe? | Idempotent? | RFC Semantics | Primary Enterprise Usage |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | Yes | Yes | Retrieve resource state without mutation. | Reading entities, searches, health checks. |
| **HEAD** | Yes | Yes | Identical to GET but omits response body. | Checking resource existence or cache validity. |
| **POST** | No | No | Submits representation; creates subordinate resource or triggers side-effect workflow. | Resource creation, complex search queries, webhook ingestion. |
| **PUT** | No | Yes | Complete resource replacement. Must supply entire document. | Full document overwrite; idempotent upserts. |
| **PATCH** | No | Conditional | Applies partial modifications to resource representation (RFC 5789 / RFC 6902 JSON Patch). | Updating single attributes (e.g. changing status to `ARCHIVED`). |
| **DELETE** | No | Yes | Removes resource representation. Multiple executions return 204 or 404 with identical final system state. | Resource deletion. |

### Canonical Error Contracts: RFC 7807 / RFC 9457 Problem Details

Ad-hoc error JSON objects (`{ "msg": "failed", "err": 52 }`) force API consumers to write bespoke error-handling parsers for every microservice. Enterprise services must adhere to **RFC 9457 Problem Details for HTTP APIs**:

```json
{
  "type": "https://api.enterprise.io/errors/insufficient-credit-balance",
  "title": "Insufficient Credit Balance",
  "status": 422,
  "detail": "The requested transaction of 500 API tokens exceeds available organization balance of 124 tokens.",
  "instance": "/v1/organizations/org_9921/billing/charges",
  "code": "BILLING_CREDIT_EXHAUSTED",
  "invalidParams": [
    {
      "name": "requestedTokens",
      "reason": "Value must be less than or equal to current balance (124)."
    }
  ],
  "correlationId": "req_881920_abf89"
}
```

---

## 4.2 Keyset and Cursor-Based Pagination vs. Offset Pagination at Scale

A widespread database scalability defect is using SQL `OFFSET` and `LIMIT` for pagination in high-traffic endpoints:

```sql
-- DANGEROUS AT SCALE: O(N) scan complexity
SELECT * FROM audit_events 
ORDER BY created_at DESC 
LIMIT 50 OFFSET 1000000;
```

When executing `OFFSET 1000000`, the database engine must scan, sort, and materialize all 1,000,050 rows from disk or memory, only to discard the first 1,000,000 rows. As users traverse deep into the table, query execution time increases linearly ($O(N)$), causing severe buffer pool churn and CPU saturation [See Section 5.4].

### Keyset (Cursor-Based) Pagination Mechanics

Keyset pagination eliminates the scan penalty by filtering records using a deterministic tuple boundary (`WHERE (created_at, id) < ($cursor_time, $cursor_id)`). The database leverages a composite B-tree index to seek directly to the boundary in $O(\log N)$ time, regardless of whether accessing page 1 or page 50,000.

```
Composite B-Tree Index: (created_at DESC, id DESC)
┌────────────────────────────────────────────────────────┐
│ Seek: [2026-02-18T14:00:00Z, 'uuid-89'] -> O(log N)   │
└────────────────────────────────────────────────────────┘
                           │
                           v (Scan exactly 50 rows forward)
┌────────────────────────────────────────────────────────┐
│ Read 50 rows -> Stop immediately                      │
└────────────────────────────────────────────────────────┘
```

```typescript
// Cursor generation and keyset pagination query in TypeScript
export interface CursorPayload {
  t: string; // ISO 8601 timestamp
  id: string; // Secondary tie-breaker identifier
}

export function encodeCursor(payload: CursorPayload): string {
  return Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
}

export function decodeCursor(cursorStr: string): CursorPayload {
  const json = Buffer.from(cursorStr, 'base64url').toString('utf8');
  return JSON.parse(json);
}

// SQL Query Builder using Keyset Pagination
export function buildKeysetQuery(cursorStr?: string, pageSize: number = 50) {
  if (!cursorStr) {
    return {
      sql: `SELECT id, organization_id, created_at, payload 
            FROM audit_events 
            ORDER BY created_at DESC, id DESC 
            LIMIT $1`,
      params: [pageSize + 1] // Fetch one extra row to determine hasNextPage
    };
  }

  const cursor = decodeCursor(cursorStr);
  return {
    sql: `SELECT id, organization_id, created_at, payload 
          FROM audit_events 
          WHERE (created_at, id) < ($1, $2)
          ORDER BY created_at DESC, id DESC 
          LIMIT $3`,
    params: [cursor.t, cursor.id, pageSize + 1]
  };
}
```

---

## 4.3 Modern Identity Architectures: OAuth 2.0 Grant Types, OIDC, and PKCE

Enterprise identity platforms decouple user authentication from resource authorization. **OpenID Connect (OIDC)** provides an identity assertion layer (issuing `id_token`), while **OAuth 2.0** provides authorization delegation (issuing `access_token` and `refresh_token`).

### OAuth 2.0 Flow Selection Matrix

| Flow | Client Type | Credential Security | Primary Enterprise Use Case |
| :--- | :--- | :--- | :--- |
| **Authorization Code with PKCE** | Public Clients (SPA, Mobile, React/Next.js) | Cannot securely store client secrets. | End-user browser logins, native mobile iOS/Android apps. |
| **Client Credentials** | Confidential Backend Services | Securely stores private key or client secret. | Machine-to-machine (M2M) microservice communication, batch ETL jobs. |
| **Device Authorization (RFC 8628)** | Input-constrained devices (CLI, Smart TV) | No browser capability. | Terminal CLI developer logins (e.g. `gcloud auth login`). |
| **Implicit Flow (DEPRECATED)** | Browser SPA | Vulnerable to token interception in URL fragments. | **FORBIDDEN:** Replaced by Authorization Code + PKCE. |

### PKCE (Proof Key for Code Exchange) Mechanics

PKCE (RFC 7636) defends against authorization code interception attacks on public clients. The client generates a high-entropy cryptographically random string (`code_verifier`) and computes its SHA-256 hash (`code_challenge = BASE64URL-ENCODE(SHA256(code_verifier))`). The `code_challenge` is transmitted during the authorization request. When exchanging the authorization code for tokens, the client provides the original `code_verifier`. The authorization server independently hashes the verifier; if it does not match the initial challenge, the exchange is rejected.

---

## 4.4 Cryptographic Token Architectures: JWT Lifecycle, Asymmetric Signing, and JWKS Rotation

JSON Web Tokens (JWT, RFC 7519) allow stateless authentication across distributed microservice fleets. A JWT consists of three base64url-encoded components separated by dots: `Header.Payload.Signature`.

```
eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImF1dGgta2V5LTIwMjYifQ.
eyJzdWIiOiJ1c3JfODgyMSIsIm9yZyI6Im9yZ185OTIxIiwicm9sZXMiOlsicmVhZCJdLCJleHAiOjE3NzA5ODc2MDB9.
kL9aZ9V8cM_...[Asymmetric RSA/ECDSA Cryptographic Signature]...
```

### Symmetric (HS256) vs. Asymmetric (RS256 / ES256) Signing

- **HS256 (HMAC SHA-256):** Uses a shared secret key for both signing and validation. Every microservice that verifies tokens must possess the shared secret. If a single low-security microservice is compromised, the attacker can forge administrative tokens across the entire enterprise.
- **RS256 / ES256 (Asymmetric):** The Central Identity Provider holds the private key to sign tokens. Microservices require only the publicly published public key to mathematically verify authenticity.

### JSON Web Key Sets (JWKS) and Zero-Downtime Key Rotation

Services must dynamically fetch and cache public keys via the identity provider's `.well-known/jwks.json` endpoint, matching the key identifier (`kid`) in the JWT header:

```typescript
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

const client = jwksClient({
  jwksUri: 'https://identity.enterprise.internal/.well-known/jwks.json',
  cache: true,
  cacheMaxEntries: 10,
  cacheMaxAge: 24 * 60 * 60 * 1000, // 24 hours
  rateLimit: true,
  jwksRequestsPerMinute: 10
});

function getKey(header: jwt.JwtHeader, callback: jwt.SigningKeyCallback) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) return callback(err);
    const signingKey = key?.getPublicKey();
    callback(null, signingKey);
  });
}

export function verifyEnterpriseJwt(token: string): Promise<any> {
  return new Promise((resolve, reject) => {
    jwt.verify(
      token,
      getKey,
      {
        algorithms: ['RS256', 'ES256'],
        issuer: 'https://identity.enterprise.internal/',
        audience: 'https://api.enterprise.internal'
      },
      (err, decoded) => {
        if (err) return reject(err);
        resolve(decoded);
      }
    );
  });
}
```

---

## 4.5 API Protection Mechanics: Sliding Window Rate Limiting and RFC-Compliant Idempotency Keys

### Distributed Rate Limiting: Sliding Window Counter with Redis

Naive fixed-window rate limiters (e.g., 100 requests per minute resetting at 12:00:00, 12:01:00) suffer from a boundary burst vulnerability: a client can fire 100 requests at 12:00:59 and another 100 requests at 12:01:01, yielding 200 requests within a 2-second window without triggering the limiter.

The **Sliding Window Counter** using Redis sorted sets (`ZSET`) evaluates request timestamps continuously:

```typescript
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL!);

export async function isRateLimitedSlidingWindow(
  identifier: string,
  limit: number = 100,
  windowSeconds: number = 60
): Promise<{ limited: boolean; currentCount: number; ttlRemainingMs: number }> {
  const now = Date.now();
  const windowStart = now - windowSeconds * 1000;
  const key = `ratelimit:${identifier}`;

  // Atomic Redis pipeline execution
  const multi = redis.multi();
  // 1. Remove timestamps older than current sliding window
  multi.zremrangebyscore(key, 0, windowStart);
  // 2. Add current request timestamp as member and score
  multi.zadd(key, now, `${now}:${Math.random()}`);
  // 3. Count remaining entries in the current window
  multi.zcard(key);
  // 4. Set key expiration to ensure cleanup
  multi.expire(key, windowSeconds);

  const results = await multi.exec();
  const requestCount = results![2][1] as number;

  return {
    limited: requestCount > limit,
    currentCount: requestCount,
    ttlRemainingMs: windowSeconds * 1000
  };
}
```

### Idempotency Keys Implementation

When a mobile payment client sends a `POST /v1/payments` request and the cellular network drops before the 200 OK response arrives, the client automatically retries. Without an idempotency layer, the user is charged twice.

```typescript
import type { Request, Response, NextFunction } from 'express';

export function idempotencyMiddleware(redis: Redis) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const idempotencyKey = req.headers['idempotency-key'] as string;
    if (!idempotencyKey || req.method !== 'POST') {
      return next();
    }

    const tenantId = (req as any).user?.tenantId ?? 'global';
    const redisKey = `idempotency:${tenantId}:${idempotencyKey}`;

    // Atomically set lock if not exists (SET NX EX)
    const acquired = await redis.set(redisKey, JSON.stringify({ state: 'PENDING' }), 'EX', 120, 'NX');

    if (!acquired) {
      // Key exists: check state
      const cached = await redis.get(redisKey);
      if (!cached) return next();

      const parsed = JSON.parse(cached);
      if (parsed.state === 'PENDING') {
        return res.status(409).json({
          error: 'A concurrent request with this Idempotency-Key is actively processing.'
        });
      }

      // Replay stored response without re-executing business logic
      res.set(parsed.headers);
      res.setHeader('X-Cache-Lookup', 'IDEMPOTENT_HIT');
      return res.status(parsed.statusCode).send(parsed.body);
    }

    // Intercept response to store result upon successful completion
    const originalSend = res.send.bind(res);
    res.send = (body: any): Response => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        redis.set(
          redisKey,
          JSON.stringify({
            state: 'COMPLETED',
            statusCode: res.statusCode,
            headers: { 'Content-Type': res.getHeader('Content-Type') },
            body: body.toString()
          }),
          'EX',
          86400 // Cache response representation for 24 hours
        );
      } else {
        // Failed request: delete lock so client can retry
        redis.del(redisKey);
      }
      return originalSend(body);
    };

    next();
  };
}
```

---
