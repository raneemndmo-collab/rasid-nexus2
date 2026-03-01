# DOC-P1-005: Integration Map — Phase 0 + Phase 1

## Module Communication Matrix

### Kernel Services (K1-K7)

| From → To | K1 Auth | K2 Tenant | K3 Audit | K4 Config | K5 Events | K6 Notification | K7 Scheduler |
|-----------|---------|-----------|----------|-----------|-----------|-----------------|--------------|
| K1 Auth | — | ✅ JWT ctx | ✅ Logs | ✅ Reads | ✅ Publishes | — | — |
| K2 Tenant | — | — | ✅ Logs | ✅ Reads | ✅ Publishes | — | — |
| K3 Audit | — | ✅ Reads ctx | — | ✅ Reads | ✅ Publishes | — | — |
| K4 Config | — | ✅ Reads ctx | ✅ Logs | — | ✅ Publishes | — | — |
| K5 Events | — | ✅ Reads ctx | ✅ Logs | ✅ Reads | — | — | — |
| K6 Notification | ✅ Validates | ✅ Reads ctx | ✅ Logs | ✅ Reads | ✅ Subscribes | — | — |
| K7 Scheduler | ✅ Validates | ✅ Reads ctx | ✅ Logs | ✅ Reads | ✅ Pub/Sub | — | — |

### Business Modules (M1-M8, M30)

| From → To | M1 Users | M2 Tenants | M3 Roles | M4 Perms | M5 Depts | M6 Emps | M7 Attend | M8 Leave | M30 Actions |
|-----------|----------|------------|----------|----------|----------|---------|-----------|----------|-------------|
| M5 Depts | — | — | — | — | — | — | — | — | ✅ Registers |
| M6 Emps | — | — | — | — | K5 Events | — | — | — | ✅ Registers |
| M7 Attend | — | — | — | — | — | K5 Events | — | — | ✅ Registers |
| M8 Leave | — | — | — | — | — | K5 Events | — | — | ✅ Registers |

### Cross-Module Communication Rules

1. **Business → Business:** Only via K5 Events (never direct DB access)
2. **Business → Kernel:** Via dependency injection (K1-K5 services)
3. **Kernel → Business:** Never (kernel has no knowledge of business modules)
4. **K6 Notification:** Triggered by K5 Events from any module
5. **K7 Scheduler:** Executes jobs that publish to K5 Events
6. **M30 Action Registry:** All module APIs register their actions here

## Event Flow Diagram

```
M5 Departments ──publish──→ K5 Events ──subscribe──→ M6 Employees
                                      ──subscribe──→ K3 Audit

M6 Employees ──publish──→ K5 Events ──subscribe──→ M7 Attendance
                                    ──subscribe──→ M8 Leave
                                    ──subscribe──→ K3 Audit

M7 Attendance ──publish──→ K5 Events ──subscribe──→ K6 Notification
                                     ──subscribe──→ K3 Audit

M8 Leave ──publish──→ K5 Events ──subscribe──→ K6 Notification
                                ──subscribe──→ K3 Audit

K7 Scheduler ──publish──→ K5 Events ──subscribe──→ M7 (scheduled reports)
```

## Database Isolation

- Each module has its own PostgreSQL database
- RLS enforced on all tables with tenant_id
- Cross-module DB access is blocked at PostgreSQL user level
- K6/K7 users cannot connect to any M5-M8 databases
- M5-M8 users cannot connect to each other's databases
