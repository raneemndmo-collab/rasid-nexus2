# DOC-P1-004: Operational Runbooks

> **Version**: 1.0.0  
> **Phase**: 1 (retroactive)  
> **Last Updated**: 2026-03-01  
> **Author**: Rasid Platform Engineering

---

## Table of Contents

1. [K6 — Notification Service](#k6--notification-service)
2. [K7 — Scheduler Service](#k7--scheduler-service)
3. [M5 — Departments Module](#m5--departments-module)
4. [M6 — Employees Module](#m6--employees-module)
5. [M7 — Attendance Module](#m7--attendance-module)
6. [M8 — Leave Module](#m8--leave-module)

---

## K6 — Notification Service

### Deployment

```bash
# Build
pnpm run build

# Environment variables required
K6_DB_HOST=<postgres-host>
K6_DB_PORT=5432
K6_DB_USER=k6_user
K6_DB_PASSWORD=<secret>
K6_DB_NAME=k6_notification_db
K6_SMTP_HOST=<smtp-host>
K6_SMTP_PORT=587
K6_SMS_PROVIDER_API_KEY=<key>
K6_PUSH_FCM_KEY=<key>

# Database migration
pnpm run migration:run -- --module=k6

# Start service
pnpm run start:prod
```

### Health Checks

| Check | Endpoint | Expected | Frequency |
|-------|----------|----------|-----------|
| Service alive | `GET /health` | `200 OK` | 30s |
| DB connectivity | `GET /health/db` | `{ status: "up" }` | 30s |
| SMTP reachable | `GET /api/k6/health/smtp` | `{ connected: true }` | 60s |
| Queue depth | `GET /api/k6/metrics/queue` | `depth < 1000` | 15s |

### Failure Modes

| Failure | Symptoms | Impact | Recovery |
|---------|----------|--------|----------|
| SMTP down | Email notifications stuck in `pending` | Email channel unavailable | 1. Check SMTP provider status. 2. Verify credentials. 3. Restart SMTP connection pool: `POST /api/k6/admin/reconnect-smtp` |
| SMS provider timeout | SMS delivery latency > 30s | SMS channel degraded | 1. Check provider dashboard. 2. Switch to backup provider via config: `PUT /api/k4/config/k6.sms.provider` |
| DB connection exhausted | `ConnectionPoolExhausted` errors | All channels down | 1. Check active connections: `SELECT count(*) FROM pg_stat_activity WHERE datname='k6_notification_db'`. 2. Restart service. 3. Increase pool size if recurring. |
| Push notification failure | FCM returns 401 | Push channel down | 1. Rotate FCM key. 2. Update config: `PUT /api/k4/config/k6.push.fcm_key` |

### Recovery Procedures

```bash
# Retry failed notifications
curl -X POST /api/k6/admin/retry-failed?since=2026-03-01T00:00:00Z

# Purge old notifications (> 90 days)
curl -X POST /api/k6/admin/purge?older_than=90d

# Check notification delivery stats
curl /api/k6/metrics/delivery-rate
```

---

## K7 — Scheduler Service

### Deployment

```bash
# Environment variables required
K7_DB_HOST=<postgres-host>
K7_DB_PORT=5432
K7_DB_USER=k7_user
K7_DB_PASSWORD=<secret>
K7_DB_NAME=k7_scheduler_db
K7_REDIS_URL=redis://<redis-host>:6379/1
K7_MAX_CONCURRENT_JOBS=10

# Database migration
pnpm run migration:run -- --module=k7

# Start service
pnpm run start:prod
```

### Health Checks

| Check | Endpoint | Expected | Frequency |
|-------|----------|----------|-----------|
| Service alive | `GET /health` | `200 OK` | 30s |
| DB connectivity | `GET /health/db` | `{ status: "up" }` | 30s |
| Redis connectivity | `GET /api/k7/health/redis` | `{ connected: true }` | 30s |
| Scheduler running | `GET /api/k7/health/scheduler` | `{ active: true, nextTick: <timestamp> }` | 60s |

### Failure Modes

| Failure | Symptoms | Impact | Recovery |
|---------|----------|--------|----------|
| Redis down | Jobs not dequeued | All scheduled jobs stalled | 1. Check Redis status. 2. Restart Redis. 3. Jobs auto-resume on reconnect. |
| Job execution timeout | `JobTimeoutExceeded` in logs | Individual job fails | 1. Check job logs: `GET /api/k7/jobs/:id/logs`. 2. Increase timeout if legitimate. 3. Retry: `POST /api/k7/jobs/:id/retry` |
| Duplicate execution | Same job runs twice | Data inconsistency risk | 1. Check idempotency keys. 2. Review execution logs. 3. All jobs MUST be idempotent by design. |
| Scheduler drift | Jobs execute late (> 5min) | SLA violation | 1. Check system clock: `timedatectl`. 2. Check CPU load. 3. Scale horizontally. |

### Recovery Procedures

```bash
# List stuck jobs
curl /api/k7/jobs?status=running&older_than=30m

# Force-complete a stuck job
curl -X POST /api/k7/jobs/:id/force-complete

# Re-sync scheduler state from DB
curl -X POST /api/k7/admin/resync
```

---

## M5 — Departments Module

### Deployment

```bash
M5_DB_HOST=<postgres-host>
M5_DB_PORT=5432
M5_DB_USER=m5_user
M5_DB_PASSWORD=<secret>
M5_DB_NAME=m5_departments_db

# Database migration
pnpm run migration:run -- --module=m5
```

### Health Checks

| Check | Endpoint | Expected | Frequency |
|-------|----------|----------|-----------|
| CRUD operations | `GET /api/m5/departments?limit=1` | `200 OK` | 60s |
| Hierarchy integrity | `GET /api/m5/departments/tree` | No orphan nodes | 300s |

### Failure Modes

| Failure | Symptoms | Impact | Recovery |
|---------|----------|--------|----------|
| Circular hierarchy | Department references itself as parent | Tree rendering fails | 1. Query: `SELECT * FROM departments WHERE parent_id = id`. 2. Fix parent_id. 3. Add CHECK constraint. |
| Orphan departments | Department references deleted parent | Incomplete tree | 1. Run: `SELECT * FROM departments d WHERE parent_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM departments p WHERE p.id = d.parent_id)`. 2. Re-parent or delete. |

### Recovery Procedures

```bash
# Rebuild department tree cache
curl -X POST /api/m5/admin/rebuild-tree

# Export department hierarchy
curl /api/m5/departments/export?format=csv
```

---

## M6 — Employees Module

### Deployment

```bash
M6_DB_HOST=<postgres-host>
M6_DB_PORT=5432
M6_DB_USER=m6_user
M6_DB_PASSWORD=<secret>
M6_DB_NAME=m6_employees_db

# Database migration
pnpm run migration:run -- --module=m6
```

### Health Checks

| Check | Endpoint | Expected | Frequency |
|-------|----------|----------|-----------|
| CRUD operations | `GET /api/m6/employees?limit=1` | `200 OK` | 60s |
| Data integrity | `GET /api/m6/health/integrity` | No duplicate employee numbers | 300s |

### Failure Modes

| Failure | Symptoms | Impact | Recovery |
|---------|----------|--------|----------|
| Duplicate employee number | Unique constraint violation | Employee creation fails | 1. Check: `SELECT employee_number, COUNT(*) FROM employees GROUP BY employee_number HAVING COUNT(*) > 1`. 2. Resolve duplicates. |
| Department reference broken | Employee references non-existent department | Employee listing incomplete | 1. Query orphaned employees. 2. Reassign to valid department. |
| PII data exposure | Unmasked data in logs | Compliance violation | 1. Check log levels. 2. Ensure PII masking middleware is active. 3. Purge affected logs. |

### Recovery Procedures

```bash
# Bulk update department assignments
curl -X POST /api/m6/admin/reassign-department \
  -d '{"from_department_id":"...", "to_department_id":"..."}'

# Export employee data (GDPR compliant)
curl /api/m6/employees/export?format=xlsx&mask_pii=true
```

---

## M7 — Attendance Module

### Deployment

```bash
M7_DB_HOST=<postgres-host>
M7_DB_PORT=5432
M7_DB_USER=m7_user
M7_DB_PASSWORD=<secret>
M7_DB_NAME=m7_attendance_db

# Database migration
pnpm run migration:run -- --module=m7
```

### Health Checks

| Check | Endpoint | Expected | Frequency |
|-------|----------|----------|-----------|
| CRUD operations | `GET /api/m7/attendance?limit=1` | `200 OK` | 60s |
| Clock-in integrity | `GET /api/m7/health/open-records` | No records open > 24h | 300s |

### Failure Modes

| Failure | Symptoms | Impact | Recovery |
|---------|----------|--------|----------|
| Missing clock-out | Records stuck in `clocked_in` status | Incorrect hours calculation | 1. Query: `SELECT * FROM attendance WHERE status = 'clocked_in' AND clock_in < NOW() - INTERVAL '16 hours'`. 2. Auto-close with policy-defined end time. |
| Timezone mismatch | Clock-in times appear wrong | Incorrect attendance records | 1. Verify server timezone: `SELECT current_setting('TIMEZONE')`. 2. Ensure all timestamps stored as TIMESTAMPTZ. |
| Duplicate clock-in | Employee clocked in twice same day | Double records | 1. Add unique constraint on (employee_id, date). 2. Merge duplicate records. |

### Recovery Procedures

```bash
# Auto-close stale attendance records
curl -X POST /api/m7/admin/auto-close-stale?threshold=16h

# Recalculate hours for a date range
curl -X POST /api/m7/admin/recalculate \
  -d '{"from":"2026-03-01", "to":"2026-03-31"}'
```

---

## M8 — Leave Module

### Deployment

```bash
M8_DB_HOST=<postgres-host>
M8_DB_PORT=5432
M8_DB_USER=m8_user
M8_DB_PASSWORD=<secret>
M8_DB_NAME=m8_leave_db

# Database migration
pnpm run migration:run -- --module=m8
```

### Health Checks

| Check | Endpoint | Expected | Frequency |
|-------|----------|----------|-----------|
| CRUD operations | `GET /api/m8/leave?limit=1` | `200 OK` | 60s |
| Balance integrity | `GET /api/m8/health/balances` | No negative balances (unless policy allows) | 300s |

### Failure Modes

| Failure | Symptoms | Impact | Recovery |
|---------|----------|--------|----------|
| Negative balance | Employee has negative leave days | Policy violation | 1. Query: `SELECT * FROM leave_balances WHERE remaining < 0`. 2. Review approved requests. 3. Adjust balance or flag for HR review. |
| Approval workflow stuck | Leave requests in `pending` > 7 days | Employee frustration | 1. Query: `SELECT * FROM leave_requests WHERE status = 'pending' AND created_at < NOW() - INTERVAL '7 days'`. 2. Escalate to next approver. 3. Send reminder notification via K6. |
| Overlapping leaves | Two approved leaves for same dates | Scheduling conflict | 1. Add overlap check in approval flow. 2. Query: `SELECT * FROM leave_requests lr1 JOIN leave_requests lr2 ON lr1.employee_id = lr2.employee_id AND lr1.id != lr2.id WHERE lr1.start_date <= lr2.end_date AND lr1.end_date >= lr2.start_date AND lr1.status = 'approved' AND lr2.status = 'approved'`. |

### Recovery Procedures

```bash
# Recalculate all leave balances for a year
curl -X POST /api/m8/admin/recalculate-balances?year=2026

# Bulk approve/reject pending requests
curl -X POST /api/m8/admin/bulk-action \
  -d '{"ids":["..."], "action":"approve", "reason":"Auto-approved by admin"}'

# Carry forward balances to new year
curl -X POST /api/m8/admin/carry-forward?from_year=2025&to_year=2026
```

---

## General Operations

### Log Levels

All modules support dynamic log level changes:

```bash
# Set log level for a specific module
curl -X PUT /api/k4/config/<module>.log.level -d '{"value":"debug"}'

# Supported levels: error, warn, info, debug, verbose
```

### Database Backup

```bash
# Backup all Phase 1 databases
for db in k6_notification_db k7_scheduler_db m5_departments_db m6_employees_db m7_attendance_db m8_leave_db; do
  pg_dump -h $DB_HOST -U postgres -Fc $db > /backups/${db}_$(date +%Y%m%d).dump
done

# Restore a specific database
pg_restore -h $DB_HOST -U postgres -d <db_name> /backups/<db_name>_<date>.dump
```

### Monitoring Alerts

| Alert | Condition | Severity | Action |
|-------|-----------|----------|--------|
| Service Down | Health check fails 3x | Critical | Page on-call engineer |
| High Latency | p95 > 2000ms for 5min | Warning | Check DB connections, scale if needed |
| Error Rate Spike | Error rate > 5% for 5min | Critical | Check logs, rollback if recent deploy |
| DB Connection Pool | Used > 80% | Warning | Increase pool size or scale service |
| Disk Usage | > 85% | Warning | Purge old data, expand storage |
