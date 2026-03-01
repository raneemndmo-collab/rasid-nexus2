# DOC-P0-003: Event Catalog — Phase 0

## Event Envelope Schema

Every event follows this envelope:

```json
{
  "event_id": "uuid",
  "event_type": "string (dot-separated)",
  "tenant_id": "uuid",
  "correlation_id": "uuid",
  "timestamp": "ISO 8601",
  "version": "integer",
  "payload": {}
}
```

## Published Events

### K1 Auth Gateway

| Event Type | Payload | Publisher |
|------------|---------|-----------|
| auth.token.issued | `{ userId, email, roles }` | K1 AuthService |
| auth.token.validated | `{ userId }` | K1 AuthService |
| auth.token.revoked | `{ userId }` | K1 AuthService |
| auth.login.success | `{ userId, email, roles }` | K1 AuthService |
| auth.login.failed | `{ email, reason, ipAddress }` | K1 AuthService |
| auth.rate_limit.exceeded | `{ ipAddress }` | K1 RateLimiter |

### K2 Tenant Isolation

| Event Type | Payload | Publisher |
|------------|---------|-----------|
| tenant.context.set | `{ tenantId, userId }` | K2 Middleware |
| tenant.rls.enabled | `{ tableName, database }` | K2 RlsService |
| tenant.access.denied | `{ tenantId, targetTenantId }` | K2 Guard |

### K3 Audit

| Event Type | Payload | Publisher |
|------------|---------|-----------|
| audit.entry.created | `{ entryId, action, entityType }` | K3 AuditService |

### K4 Configuration

| Event Type | Payload | Publisher |
|------------|---------|-----------|
| config.changed | `{ key, value }` | K4 ConfigService |
| config.deleted | `{ key }` | K4 ConfigService |

### M1 Auth Users

| Event Type | Payload | Publisher |
|------------|---------|-----------|
| auth.user.created | `{ userId, email }` | M1 UserService |
| auth.user.updated | `{ userId, changes }` | M1 UserService |
| auth.user.deleted | `{ userId }` | M1 UserService |
| auth.user.role_assigned | `{ userId, role }` | M1 UserService |

### M2 Tenants

| Event Type | Payload | Publisher |
|------------|---------|-----------|
| tenant.created | `{ tenantId, name, slug }` | M2 TenantService |
| tenant.updated | `{ tenantId, changes }` | M2 TenantService |
| tenant.deleted | `{ tenantId }` | M2 TenantService |

### M3 Roles

| Event Type | Payload | Publisher |
|------------|---------|-----------|
| role.created | `{ roleId, name }` | M3 RoleService |
| role.updated | `{ roleId, changes }` | M3 RoleService |
| role.deleted | `{ roleId }` | M3 RoleService |

### M4 Permissions

| Event Type | Payload | Publisher |
|------------|---------|-----------|
| permission.created | `{ permissionId, code }` | M4 PermissionService |
| permission.deleted | `{ permissionId }` | M4 PermissionService |

### M30 Action Registry

| Event Type | Payload | Publisher |
|------------|---------|-----------|
| action.registered | `{ actionId, code, module }` | M30 ActionService |
| action.deactivated | `{ actionId, code }` | M30 ActionService |

## NATS JetStream Streams

| Stream | Subjects | Retention |
|--------|----------|-----------|
| auth | auth.*, auth.> | Limits (7 days) |
| tenant | tenant.*, tenant.> | Limits (7 days) |
| audit | audit.*, audit.> | Limits (30 days) |
| config | config.*, config.> | Limits (7 days) |
| events | events.*, events.> | Limits (7 days) |

## Dead Letter Queue

Events that fail processing after 3 retry attempts are moved to the `dead_letter_queue` table in k5_events_db with:
- Original event payload
- Error message
- Attempt count
- Timestamp
