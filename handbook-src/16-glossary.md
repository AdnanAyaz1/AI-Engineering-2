# Chapter 16: Comprehensive Engineering and AI Glossary

### 16.1 Distributed Systems and Architecture Terms
- **ACID:** An acronym representing Atomicity, Consistency, Isolation, and Durability—the core transactional guarantees provided by relational databases [See Section 6.1].
- **Aggregate Root:** The primary entity in a Domain-Driven Design aggregate that controls access, manages internal entity lifecycle, and enforces business invariants [See Section 1.2].
- **Backpressure:** A flow-control mechanism in asynchronous streaming where a slow consumer signals a fast producer to pause data emission, preventing memory exhaustion [See Section 3.2].
- **Bounded Context:** An explicit boundary within Domain-Driven Design wherein a domain model applies and terms within the Ubiquitous Language carry unambiguous semantic meanings [See Section 1.2].
- **Bulkhead Pattern:** An isolation pattern where system resources (threads, connections, memory) are partitioned into isolated pools so that failure in one pool does not bring down the entire system [See Section 8.5].
- **CAP Theorem:** Formulated by Eric Brewer, states that a distributed data store can simultaneously guarantee at most two of three properties: Consistency, Availability, and Partition Tolerance [See Section 0.3].
- **Circuit Breaker:** A fault-tolerance design pattern that monitors remote calls and temporarily halts requests to a failing service, allowing it time to recover [See Section 8.5].
- **CQRS:** Command Query Responsibility Segregation, an architectural pattern separating read and write data models [See Section 1.3].
- **Dead-Letter Queue (DLQ):** A secondary queue where messages that fail processing after maximum retry attempts are routed for human triage and diagnostic debugging [See Section 7.5].
- **Domain Event:** A record representing an immutable business occurrence that took place in the past within a domain bounded context [See Section 1.2].
- **Event Sourcing:** An architectural pattern where state changes are stored as an append-only sequence of immutable events rather than overwriting current state [See Section 1.3].
- **Idempotency:** A property of operations whereby performing the operation multiple times produces the identical outcome as performing it once [See Section 4.1, Section 4.5].
- **Outbox Pattern:** A reliable messaging pattern where outbound events are stored in a dedicated database table within the same ACID transaction as the business entity update [See Section 8.4].
- **PACELC Theorem:** An extension of the CAP theorem stating that in the presence of partitions ($P$), one trades off availability ($A$) and consistency ($C$); else ($E$), one trades off latency ($L$) and consistency ($C$) [See Section 0.3].
- **Saga Pattern:** A distributed transaction pattern coordinating a series of local transactions with corresponding compensating transactions to achieve eventual consistency without two-phase commit [See Section 8.3].

### 16.2 Database and Storage Terms
- **Autovacuum:** A background daemon in PostgreSQL that automatically reclaims dead tuple storage and updates table statistics for the query planner [See Section 6.2].
- **B-Tree Index:** A balanced multi-way tree structure optimized for storage systems to provide logarithmic search, range scans, and ordered retrieval [See Section 5.2].
- **BRIN Index:** Block Range Index in PostgreSQL that stores minimum and maximum values for physical table block ranges, ideal for sequential append-only data [See Section 5.2].
- **Covering Index:** An index that includes non-search columns via the `INCLUDE` clause, enabling index-only scans without accessing the table heap [See Section 5.3].
- **Dead Tuple:** An obsolete row version in PostgreSQL created by an `UPDATE` or `DELETE` statement that is no longer visible to any active transaction [See Section 6.2].
- **GIN Index:** Generalized Inverted Index in PostgreSQL designed for indexing composite values such as JSONB documents, arrays, and full-text search vectors [See Section 5.2].
- **Keyset Pagination:** A pagination pattern using sequential tuple comparison filters instead of `OFFSET`, providing constant $O(\log N)$ retrieval time [See Section 4.2].
- **MVCC:** Multi-Version Concurrency Control, a database engine technique where each write creates a new version of the row, allowing readers to query without locking writers [See Section 6.2].
- **WAL (Write-Ahead Log):** An append-only log on disk where changes must be recorded and flushed before they are applied to the database table files, ensuring crash durability [See Section 6.5].
- **Write Skew:** A concurrency anomaly occurring under Repeatable Read isolation where two concurrent transactions read overlapping data, make disjoint writes, and violate a global invariant [See Section 6.3].

### 16.3 AI, Vector Search, and RAG Terms
- **ANN (Approximate Nearest Neighbor):** Algorithmic techniques (such as HNSW and IVFFlat) that trade off minor recall accuracy to achieve sub-millisecond vector similarity search [See Section 10.4].
- **BM25:** A sparse probabilistic lexical ranking algorithm that scores documents based on term frequency and inverse document frequency [See Section 9.4].
- **Chunking:** The process of partitioning continuous document text into discrete semantic segments suitable for embedding model vectorization [See Section 10.2].
- **Context Window:** The maximum sequence length of tokens that an LLM can accept in a single inference call [See Section 9.2].
- **Cosine Distance:** A geometric metric measuring the angular difference between two vectors, defined as $1 - \cos(\theta)$ [See Section 10.3].
- **Cross-Encoder Reranker:** A deep transformer model that jointly scores a query and document pair via full cross-attention layers, yielding superior ranking precision [See Section 9.4].
- **Dense Embedding:** A high-dimensional floating-point vector representation of text where semantic relationships are captured as spatial proximity [See Section 10.3].
- **HNSW:** Hierarchical Navigable Small World, a multi-layer graph-based vector index algorithm providing high-speed logarithmic nearest-neighbor search [See Section 10.4].
- **Hybrid Search:** Combining dense vector retrieval with sparse lexical BM25 search using algorithms like Reciprocal Rank Fusion [See Section 9.4].
- **Lost-in-the-Middle:** The empirical observation that transformer language models retrieve facts placed in the center of long context prompts with lower accuracy than facts at the beginning or end [See Section 9.2].
- **RAG:** Retrieval-Augmented Generation, an AI architecture that enhances LLM generation by dynamically injecting retrieved external context into the prompt [See Section 9.3].
- **Ragas:** An automated evaluation framework for calculating context relevance, faithfulness, and answer relevance across RAG pipelines [See Section 9.5].
- **Reciprocal Rank Fusion (RRF):** A rank aggregation algorithm that merges rankings from disparate search systems without requiring score normalization [See Section 9.4].
- **Vector Index:** A specialized data structure designed for efficient high-dimensional nearest neighbor search (e.g. pgvector, Pinecone, Qdrant) [See Section 10.5].

### 16.4 Cloud, Security, and Operational Terms
- **ABAC:** Attribute-Based Access Control, an authorization paradigm evaluating dynamic attributes of the subject, resource, action, and environment [See Section 12.2].
- **Argon2id:** A memory-hard password hashing algorithm designed to resist GPU brute-force cracking and side-channel attacks [See Section 12.4].
- **Canary Deployment:** A progressive delivery technique where a new release receives a tiny percentage of live production traffic to verify health metrics before full rollout [See Section 11.5].
- **CSP (Content Security Policy):** An HTTP response header instructing the browser which scripts, images, and resources are permitted to execute, mitigating XSS [See Section 12.3].
- **Error Budget:** The permissible amount of service downtime or errors defined as $100\% - \text{SLO}$ [See Section 13.5].
- **Graceful Shutdown:** An operational procedure where a terminating process stops accepting new traffic, finishes in-flight requests, and drains database connections before exiting [See Section 3.4].
- **JWKS:** JSON Web Key Set, a standardized endpoint publishing public cryptographic keys used to verify signed JSON Web Tokens [See Section 4.4].
- **OpenTelemetry:** A vendor-neutral open-source observability framework providing APIs and SDKs to generate, collect, and export traces, metrics, and logs [See Section 13.2].
- **SLI / SLO:** Service Level Indicator (a measured metric) and Service Level Objective (the agreed reliability target) [See Section 13.5].
- **SSRF:** Server-Side Request Forgery, an attack where a server is coerced into making unauthorized network requests to internal network services [See Section 12.1].
