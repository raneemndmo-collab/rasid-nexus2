# DOC-P0-001: Architecture Overview — Rasid Platform Phase 0

## 1. System Architecture

Rasid Platform follows a **Clean Architecture** pattern with strict layer separation:

```
┌─────────────────────────────────────────────────────────┐
│                    Presentation Layer                     │
│  Controllers, Middleware, Guards, Interceptors, Filters  │
├─────────────────────────────────────────────────────────┤
│                    Application Layer                     │
│  Commands, Queries, DTOs, Services, Mappers             │
├─────────────────────────────────────────────────────────┤
│                      Domain Layer                        │
│  Entities, Value Objects, Events, Errors, Interfaces    │
├─────────────────────────────────────────────────────────┤
│                   Infrastructure Layer                    │
│  Persistence, Messaging, External Services, Config      │
└─────────────────────────────────────────────────────────┘
```

## 2. Module Dependency Graph

```
K1 Auth Gateway ← K2 Tenant Isolation ← K3 Audit ← K4 Config ‖ K5 Event Bus
                                                          ↓
                    M1 Auth Users → M2 Tenants → M3 Roles ‖ M4 Permissions → M30 Action Registry
```

**Dependency Rules:**
- Domain layer has ZERO external dependencies
- Application layer depends only on Domain interfaces
- Infrastructure implements Domain interfaces (Dependency Inversion)
- Presentation depends on Application DTOs and services
- No circular dependencies between modules
- Business modules (M*) communicate ONLY through K5 Event Bus

## 3. Data Flow

### Authentication Flow
1. Client → POST /auth/login → K1 Auth Controller
2. K1 validates credentials via M1 UserService (through interface)
3. K1 issues JWT token pair (access + refresh)
4. K3 Audit logs the login event
5. K5 publishes `auth.login.success` event

### Tenant Isolation Flow
1. Every request passes through K2 TenantContext Middleware
2. Middleware extracts `tenant_id` from JWT payload
3. Sets PostgreSQL session variable `app.current_tenant_id`
4. RLS policies automatically filter all queries by tenant

### Event Flow
1. Service publishes event → K5 Event Bus
2. K5 validates event schema
3. K5 stores event in Event Store (append-only)
4. K5 publishes to NATS JetStream
5. Subscribers receive event with at-least-once delivery
6. Failed events (3 retries) → Dead Letter Queue

## 4. Databases (10 total)

| Database | Module | Purpose |
|----------|--------|---------|
| k1_auth_db | K1 | JWT tokens, revocation list |
| k2_tenant_db | K2 | Tenant context metadata |
| k3_audit_db | K3 | Append-only audit logs |
| k4_config_db | K4 | Configuration key-value store |
| k5_events_db | K5 | Event store, schemas, DLQ |
| m1_auth_users_db | M1 | User accounts, credentials |
| m2_tenants_db | M2 | Tenant profiles, settings |
| m3_roles_db | M3 | Role definitions |
| m4_permissions_db | M4 | Permission definitions |
| m30_actions_db | M30 | Action registry |

## 5. Infrastructure

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Runtime | Node.js 22 + NestJS 10 | Application framework |
| Database | PostgreSQL 16 | Primary data store |
| Cache | Redis 7 | K4 config caching |
| Event Bus | NATS JetStream 2.10 | Event streaming |
| Monitoring | Prometheus + Grafana | Metrics and dashboards |
| Container | Docker + Kubernetes | Deployment |
| CI/CD | GitHub Actions | Pipeline |

## 6. Security Architecture

- **Authentication**: JWT with HMAC-SHA256, token expiry, revocation
- **Tenant Isolation**: PostgreSQL RLS on every table
- **Database Isolation**: Separate user per database, REVOKE PUBLIC
- **Password Storage**: bcrypt with 12 salt rounds
- **Network**: Kubernetes NetworkPolicy (default deny)
- **Audit**: Append-only audit log for all mutations
