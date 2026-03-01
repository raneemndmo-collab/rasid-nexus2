# DOC-P2-005: Event Catalog — Phase 2 Update

**Version:** 2.0.0  
**Phase:** 2  
**Generated:** 2026-03-01  

---

## Overview

This document extends the Phase 0+1 Event Catalog with all domain events introduced in Phase 2. All events follow the `EventEnvelope<T>` standard defined in `src/shared/domain/event-envelope.ts`.

## Event Envelope Standard

```typescript
interface EventEnvelope<T> {
  eventId: string;       // UUID
  eventType: string;     // e.g., 'storage.object.created'
  aggregateId: string;   // Entity ID
  tenantId: string;      // Tenant UUID
  timestamp: Date;
  version: number;
  payload: T;
  metadata?: Record<string, any>;
}
```

---

## K8 Storage Events

| Event Type | Payload | Emitted When |
|------------|---------|--------------|
| `storage.object.created` | `{ id, bucket, key, size, content_type }` | Object uploaded |
| `storage.object.deleted` | `{ id, bucket, key }` | Object deleted |
| `storage.quota.exceeded` | `{ tenant_id, used, limit }` | Tenant exceeds storage quota |
| `storage.object.accessed` | `{ id, accessor_id }` | Object downloaded |

## K9 Monitoring Events

| Event Type | Payload | Emitted When |
|------------|---------|--------------|
| `monitoring.metric.recorded` | `{ name, value, labels }` | Metric recorded |
| `monitoring.alert.triggered` | `{ rule_id, metric_name, value, threshold }` | Alert threshold breached |
| `monitoring.alert.resolved` | `{ rule_id }` | Alert condition resolved |
| `monitoring.health.degraded` | `{ service, status }` | Health check fails |

## K10 Registry Events

| Event Type | Payload | Emitted When |
|------------|---------|--------------|
| `registry.service.registered` | `{ id, name, version, host, port }` | Service registers |
| `registry.service.deregistered` | `{ id, name }` | Service deregisters |
| `registry.service.stale` | `{ id, name, last_heartbeat }` | Heartbeat timeout |

## M9 Payroll Events

| Event Type | Payload | Emitted When |
|------------|---------|--------------|
| `payroll.run.created` | `{ id, period, status }` | Payroll run created |
| `payroll.run.calculated` | `{ id, total_net, employee_count }` | Calculation complete |
| `payroll.run.approved` | `{ id, approved_by }` | Run approved |
| `payroll.run.paid` | `{ id, payment_date }` | Payment processed |
| `payroll.item.created` | `{ id, employee_id, net }` | Per-employee item created |

## M10 Settings Events

| Event Type | Payload | Emitted When |
|------------|---------|--------------|
| `settings.updated` | `{ key, scope, old_value, new_value }` | Setting changed |
| `settings.created` | `{ key, scope, value }` | New setting created |
| `settings.deleted` | `{ key, scope }` | Setting removed |

## M11 AI Events

| Event Type | Payload | Emitted When |
|------------|---------|--------------|
| `ai.request.completed` | `{ capability, model, tokens, latency_ms, cost }` | AI call succeeds |
| `ai.request.failed` | `{ capability, error, provider_level }` | AI call fails |
| `ai.fallback.triggered` | `{ from_level, to_level, reason }` | Fallback chain activated |
| `ai.killswitch.toggled` | `{ enabled, reason, toggled_by }` | Kill switch changed |
| `ai.budget.warning` | `{ tenant_id, used, limit, percentage }` | Budget 80% reached |
| `ai.budget.exceeded` | `{ tenant_id, used, limit }` | Budget limit hit |
| `ai.model.registered` | `{ id, name, provider }` | New AI model added |

## M12 Notification Events

| Event Type | Payload | Emitted When |
|------------|---------|--------------|
| `notification.sent` | `{ id, user_id, type, priority }` | Notification created |
| `notification.read` | `{ id, user_id, read_at }` | User reads notification |
| `notification.subscription.created` | `{ user_id, topic }` | User subscribes |

## M13 File Events

| Event Type | Payload | Emitted When |
|------------|---------|--------------|
| `file.uploaded` | `{ id, name, size, mime_type, folder_id }` | File uploaded |
| `file.deleted` | `{ id, name }` | File deleted |
| `file.shared` | `{ id, shared_with, permission }` | File shared |
| `file.folder.created` | `{ id, name, parent_id }` | Folder created |
| `file.moved` | `{ id, from_folder, to_folder }` | File moved |

## M14 Report Events

| Event Type | Payload | Emitted When |
|------------|---------|--------------|
| `report.definition.created` | `{ id, name, module }` | Report defined |
| `report.execution.started` | `{ id, definition_id }` | Report execution begins |
| `report.execution.completed` | `{ id, definition_id, row_count }` | Report ready |
| `report.execution.failed` | `{ id, error }` | Report execution fails |
| `report.scheduled` | `{ definition_id, cron }` | Report scheduled |

---

## Total Event Count

| Phase | Module Count | Event Count |
|-------|-------------|-------------|
| Phase 0 | K1-K5, M1-M4, M30 | 28 |
| Phase 1 | K6-K7, M5-M8 | 18 |
| Phase 2 | K8-K10, M9-M14 | 42 |
| **Total** | **25 modules** | **88 events** |
