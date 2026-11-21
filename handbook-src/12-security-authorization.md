# Chapter 12: Application Security, Identity, and Authorization

## 12.1 OWASP Top 10 Enterprise Hardening: Injection Defenses, Broken Object-Level Auth, and SSRF

Application security cannot be treated as an afterthought or outsourced to perimeter firewalls. In modern distributed cloud topologies, zero-trust security dictates that **every application boundary must assume the internal network is fully compromised.**

### 1. SQL and Command Injection

- **Vulnerability:** Concatenating unsanitized user input directly into SQL strings (`SELECT * FROM users WHERE email = '` + input + `'`).
- **Mitigation:** Exclusively utilize parameterized queries or type-safe SQL query builders (e.g. Kysely, pg-promise). Never construct raw SQL via string interpolation.

### 2. Broken Object-Level Authorization (BOLA / IDOR)

- **Vulnerability:** The client requests `/v1/documents/doc_9921/download`. The server verifies that the user is authenticated, but fails to check whether `doc_9921` belongs to the requesting user's organization. An attacker iterates through sequential IDs to exfiltrate private enterprise data.
- **Mitigation:** Enforce tenant ownership predicates at the database query layer:
  `SELECT * FROM documents WHERE id = $1 AND organization_id = $2;`

### 3. Server-Side Request Forgery (SSRF)

- **Vulnerability:** An application exposes a webhook or URL preview endpoint (`POST /v1/preview { "url": "http://169.254.169.254/latest/meta-data/" }`). An attacker supplies an internal cloud metadata IP or VPC private IP (`10.0.0.0/8`), exfiltrating AWS IAM role credentials or internal microservice tokens.
- **Mitigation:**
  - Parse and resolve hostnames via DNS lookup before dispatching HTTP calls.
  - Reject all RFC 1918 private IP ranges (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), loopback addresses (`127.0.0.0/8`), and cloud metadata IP (`169.254.169.254`).
  - Disable HTTP redirect following (`maxRedirects: 0`), preventing an attacker from redirecting a public URL to an internal private address.

---

## 12.2 Fine-Grained Authorization: Role-Based Access Control (RBAC) vs. Attribute-Based Access Control (ABAC)

As organizations scale, basic permission models prove insufficient to represent real-world enterprise compliance boundaries.

### Comparison of Authorization Architectures

| Dimension | Role-Based Access Control (RBAC) | Attribute-Based Access Control (ABAC) |
| :--- | :--- | :--- |
| **Decision Basis** | Static user roles assigned to accounts (e.g., `ADMIN`, `MEMBER`, `BILLING_OPERATOR`). | Dynamic evaluation of attributes: Subject (user), Resource, Action, and Environment. |
| **Complexity** | Low; trivial database schema (`user_roles` join table). | Higher; requires a dedicated policy evaluation engine (e.g. Open Policy Agent, Cedar). |
| **Role Explosion** | High risk; organizations end up creating dozens of hyper-specific roles (`REGIONAL_BILLING_LEAD_DE`). | **Zero role explosion**; policies express dynamic rules via Boolean expressions. |
| **Context Awareness** | Blind to temporal or environmental context. | Can enforce: "Permit read only if `user.department == resource.department` AND `time < 18:00`". |

### Practical ABAC Policy Evaluation Engine in TypeScript

```typescript
export interface Subject {
  id: string;
  department: string;
  clearanceLevel: number;
  roles: string[];
}

export interface Resource {
  type: string;
  department: string;
  requiredClearance: number;
  isLocked: boolean;
}

export interface Environment {
  currentTimestamp: number;
  ipAddress: string;
  isMfaVerified: boolean;
}

export type Action = 'READ' | 'WRITE' | 'DELETE' | 'EXPORT';

export class AbacPolicyEngine {
  public static evaluate(
    subject: Subject,
    action: Action,
    resource: Resource,
    env: Environment
  ): { permitted: boolean; reason?: string } {
    // Rule 1: Locked resources cannot be modified by anyone
    if (resource.isLocked && (action === 'WRITE' || action === 'DELETE')) {
      return { permitted: false, reason: 'Resource is locked by administrative compliance hold.' };
    }

    // Rule 2: Delete operations require MFA verification
    if (action === 'DELETE' && !env.isMfaVerified) {
      return { permitted: false, reason: 'Step-up MFA verification required for deletion.' };
    }

    // Rule 3: Clearance level check
    if (subject.clearanceLevel < resource.requiredClearance) {
      return { permitted: false, reason: 'Subject clearance level insufficient.' };
    }

    // Rule 4: Cross-department isolation (unless SuperAdmin)
    if (subject.department !== resource.department && !subject.roles.includes('SUPER_ADMIN')) {
      return { permitted: false, reason: 'Cross-department data access forbidden.' };
    }

    return { permitted: true };
  }
}
```

---

## 12.3 Modern Browser Security Headers: Strict CSP, HSTS, X-Frame-Options, and Referrer Policies

Web applications must instruct the browser to defend itself against Cross-Site Scripting (XSS), clickjacking, and MIME-confusion attacks by emitting standardized HTTP security headers.

### Production Express Security Headers Configuration

```typescript
import helmet from 'helmet';
import type { Application } from 'express';

export function configureEnterpriseSecurityHeaders(app: Application): void {
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'strict-dynamic'", "'nonce-rAnd0m123'"], // Nonce-based strict CSP
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https://cdn.enterprise.internal'],
          connectSrc: ["'self'", 'https://api.enterprise.internal', 'https://telemetry.enterprise.internal'],
          fontSrc: ["'self'", 'https://fonts.gstatic.com'],
          objectSrc: ["'none'"],
          baseUri: ["'self'"],
          formAction: ["'self'"],
          frameAncestors: ["'none'"], // Defends against Clickjacking (replaces X-Frame-Options)
          upgradeInsecureRequests: []
        }
      },
      strictTransportSecurity: {
        maxAge: 63072000, // 2 Years HSTS enforcement
        includeSubDomains: true,
        preload: true
      },
      referrerPolicy: {
        policy: 'strict-origin-when-cross-origin'
      },
      crossOriginEmbedderPolicy: true,
      crossOriginOpenerPolicy: { policy: 'same-origin' },
      crossOriginResourcePolicy: { policy: 'same-site' }
    })
  );
}
```

---

## 12.4 Cryptographic Engineering: Secrets Management, Envelope Encryption, and Argon2id Password Hashing

In enterprise architectures, cryptographic primitives must be selected strictly according to modern standards. Legacy algorithms such as MD5, SHA-1, DES, and raw 3DES are strictly prohibited.

### 1. Password Hashing: Argon2id

Passwords must never be hashed using general-purpose cryptographic hash functions (SHA-256) because modern GPUs can compute billions of SHA-256 hashes per second. Applications must utilize **Argon2id** (the winner of the Password Hashing Competition), which combines memory-hard execution with resistance to GPU brute-force and side-channel attacks:

```typescript
import argon2 from 'argon2';

export async function hashPassword(plainText: string): Promise<string> {
  return await argon2.hash(plainText, {
    type: argon2.argon2id,
    memoryCost: 65536, // 64 MB of RAM required per hash computation
    timeCost: 3,       // 3 iterations
    parallelism: 4     // 4 parallel threads
  });
}

export async function verifyPassword(hash: string, plainText: string): Promise<boolean> {
  return await argon2.verify(hash, plainText);
}
```

### 2. Envelope Encryption for Data at Rest

When storing sensitive customer PII or API tokens, services must utilize **Envelope Encryption**:
- **Data Encryption Key (DEK):** A unique, single-use AES-256-GCM symmetric key generated locally to encrypt the plaintext data.
- **Key Encryption Key (KEK):** A master key stored securely within a Hardware Security Module (HSM) or Cloud Key Management Service (AWS KMS, Google Cloud KMS, HashiCorp Vault). The KEK is used exclusively to encrypt the DEK.
- **Storage:** The application persists the ciphertext and the *encrypted DEK* side-by-side in PostgreSQL. The master KEK never leaves the HSM boundary.

---

## 12.5 Cross-Origin Resource Sharing (CORS) and Cross-Site Request Forgery (CSRF) Hardening

### CORS Is Not an Authorization Mechanism

A common misconception is that CORS prevents unauthorized clients from accessing an API. CORS is purely a **browser security enforcement mechanism** that stops malicious scripts running in one origin from reading responses from a different origin. Server-side scripts (e.g. curl or Python) ignore CORS headers entirely.

### Enterprise CORS Guidelines:
1. **Never use wildcard origins with credentials:** `Access-Control-Allow-Origin: *` combined with `Access-Control-Allow-Credentials: true` is forbidden by browsers and introduces severe security holes.
2. **Explicit Whitelisting:** Dynamically validate the incoming `Origin` header against an explicit whitelist of trusted production domain names.

### CSRF Mitigation with Modern Cookie Attributes

Modern enterprise web architectures protect against Cross-Site Request Forgery (CSRF) by enforcing strict cookie attributes:
- `HttpOnly`: Prevents client-side JavaScript (`document.cookie`) from reading the session token, mitigating session theft via XSS.
- `Secure`: Ensures the cookie is only transmitted over encrypted HTTPS connections.
- `SameSite=Lax` or `SameSite=Strict`: Prevents the browser from sending the cookie in cross-site requests, completely eliminating CSRF vulnerabilities for modern browsers without requiring legacy synchronization tokens.

---
