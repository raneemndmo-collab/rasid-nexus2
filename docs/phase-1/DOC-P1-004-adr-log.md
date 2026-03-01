# DOC-P1-004: ADR Log — Phase 1

## ADR-P1-001: Multi-Channel Notification Architecture

**Status:** Accepted  
**Date:** 2026-03-01  
**Context:** K6 needs to support 4 notification channels (email, SMS, push, in-app) with extensibility for future channels.  
**Decision:** Implement channel dispatchers as a Strategy pattern with a common `IChannelDispatcher` interface. Each channel is a separate implementation injected via DI. Template engine is a separate service for content rendering.  
**Consequences:** Easy to add new channels without modifying existing code. Each channel can be independently tested and deployed.

## ADR-P1-002: Scheduler Job Execution Model

**Status:** Accepted  
**Date:** 2026-03-01  
**Context:** K7 needs to handle both one-time and recurring jobs with retry logic and dead-letter handling.  
**Decision:** Use a polling-based model with `next_run_at` column. Jobs are picked up by a worker that queries for due jobs every 10 seconds. Failed jobs are retried with exponential backoff. Jobs exceeding `max_retries` are marked as `dead`.  
**Consequences:** Simple and reliable. No external scheduler dependency. Supports horizontal scaling by adding more workers with row-level locking.

## ADR-P1-003: Department Hierarchy with Materialized Path

**Status:** Accepted  
**Date:** 2026-03-01  
**Context:** M5 needs to support hierarchical department structures with efficient tree queries.  
**Decision:** Use materialized path pattern (e.g., `/root/child/grandchild/`) stored in a `path` column alongside `parent_id` and `level`. This allows efficient subtree queries using LIKE prefix matching.  
**Consequences:** Fast reads for tree traversal. Slightly more complex writes (path must be updated on parent change). Trade-off accepted for read-heavy workload.

## ADR-P1-004: Leave Balance Management

**Status:** Accepted  
**Date:** 2026-03-01  
**Context:** M8 needs to track leave balances per employee per leave type per year, with automatic deduction on approval.  
**Decision:** Maintain a `leave_balances` table with `total_days`, `used_days`, and `remaining_days`. Balance is deducted atomically when a leave request is approved. Balance initialization is a separate operation per employee per year.  
**Consequences:** Clear audit trail. Prevents over-allocation. Supports multiple leave types and yearly rollover.

## ADR-P1-005: Database Isolation for K6/K7

**Status:** Accepted  
**Date:** 2026-03-01  
**Context:** K6 and K7 are kernel services but should not have access to business module databases.  
**Decision:** Revoke CONNECT privilege from k6_user and k7_user on all business databases (M1-M8, M30). Each user can only connect to their own database.  
**Consequences:** Enforces the "Database per Module" principle at the PostgreSQL level. Cross-module communication must go through K5 Event Bus.
