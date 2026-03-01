# DOC-P0-006: Architecture Decision Records — Phase 0

## ADR-001: NestJS as Application Framework

**Status:** Accepted  
**Date:** 2026-03-01  
**Context:** Need a TypeScript-first framework with built-in DI, modularity, and enterprise patterns.  
**Decision:** Use NestJS 10 with TypeScript strict mode.  
**Rationale:** NestJS provides native DI, module system, guards, interceptors, and pipes that align with Clean Architecture. Strong TypeORM integration and OpenAPI support.  
**Consequences:** Team must follow NestJS patterns. Locked to Node.js runtime.

## ADR-002: PostgreSQL with RLS for Tenant Isolation

**Status:** Accepted  
**Date:** 2026-03-01  
**Context:** Multi-tenant platform requires strong data isolation.  
**Decision:** Use PostgreSQL 16 Row-Level Security (RLS) with per-module databases.  
**Rationale:** RLS provides database-level isolation that cannot be bypassed by application bugs. Separate databases per module enforce the "Database per Module" principle.  
**Consequences:** Every query must have tenant context set. Slightly higher connection overhead.

## ADR-003: NATS JetStream for Event Bus

**Status:** Accepted  
**Date:** 2026-03-01  
**Context:** Need reliable event delivery with at-least-once semantics.  
**Decision:** Use NATS JetStream 2.10 instead of Kafka.  
**Rationale:** NATS JetStream provides simpler operations, lower resource footprint, and sufficient throughput for Phase 0. JetStream adds persistence and replay to core NATS.  
**Consequences:** Must implement idempotency at consumer level. DLQ managed in PostgreSQL.

## ADR-004: JWT with HMAC-SHA256 for Authentication

**Status:** Accepted  
**Date:** 2026-03-01  
**Context:** Need stateless authentication with token revocation capability.  
**Decision:** Use JWT with HS256 signing, stored token hashes for revocation.  
**Rationale:** HS256 is fast for issuance (<50ms target). Token hash storage enables revocation without blacklist overhead. JWKS endpoint supports future migration to RS256.  
**Consequences:** Token revocation requires DB lookup. Must migrate to RS256 for cross-service validation in later phases.

## ADR-005: Redis for Configuration Caching

**Status:** Accepted  
**Date:** 2026-03-01  
**Context:** K4 Config reads must be <1ms for cached values.  
**Decision:** Use Redis 7 as cache layer with 5-minute TTL and cache invalidation on write.  
**Rationale:** Redis provides sub-millisecond reads. Cache invalidation on write ensures consistency.  
**Consequences:** Cache miss adds ~10ms. Must handle Redis unavailability gracefully.

## ADR-006: Append-Only Audit Log

**Status:** Accepted  
**Date:** 2026-03-01  
**Context:** Audit trail must be tamper-proof.  
**Decision:** K3 audit_logs table is append-only. No UPDATE or DELETE operations allowed.  
**Rationale:** Regulatory compliance requires immutable audit trails. Application-level enforcement prevents accidental deletion.  
**Consequences:** Table grows indefinitely. Must implement archival strategy in later phases.

## ADR-007: Clean Architecture with Strict Layer Boundaries

**Status:** Accepted  
**Date:** 2026-03-01  
**Context:** Platform with 69 modules needs consistent, maintainable structure.  
**Decision:** Enforce Clean Architecture with Domain → Application → Infrastructure → Presentation layers.  
**Rationale:** Strict boundaries enable independent testing, technology swaps, and parallel development.  
**Consequences:** More boilerplate code. Must enforce via static analysis (SA-001 through SA-012).

## ADR-008: M30 Action Registry as Central Gate

**Status:** Accepted  
**Date:** 2026-03-01  
**Context:** Need to prevent unregistered API calls and enforce action governance.  
**Decision:** Every API action must be registered in M30 before it can be called.  
**Rationale:** Centralized registry enables action discovery, permission mapping, and audit completeness.  
**Consequences:** New endpoints require M30 registration. ACT_UNREGISTERED error for unregistered actions.

## ADR-009: CQRS Pattern for Commands and Queries

**Status:** Accepted  
**Date:** 2026-03-01  
**Context:** Need to separate read and write paths for scalability.  
**Decision:** Implement CQRS with separate command and query handlers in Application layer.  
**Rationale:** Enables independent scaling of reads and writes. Aligns with event-driven architecture.  
**Consequences:** More handler classes. Must maintain consistency between command and query models.

## ADR-010: Database Per Module

**Status:** Accepted  
**Date:** 2026-03-01  
**Context:** 69 modules need data isolation and independent evolution.  
**Decision:** Each module gets its own PostgreSQL database with dedicated user.  
**Rationale:** Prevents cross-module data coupling. Enables independent schema migrations and scaling.  
**Consequences:** Higher operational overhead. Cross-module queries must go through APIs or events.
