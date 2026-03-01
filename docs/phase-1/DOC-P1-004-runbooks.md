# DOC-P1-004: Runbooks — Phase 1 Modules

## K6 Notification Service

### Deployment
```bash
# Build and deploy K6
docker build -t rasid/k6-notification:latest --build-arg MODULE=k6-notification .
kubectl apply -f infrastructure/kubernetes/k6-notification/
kubectl rollout status deployment/k6-notification -n rasid
```

### Health Checks
- **Endpoint:** `GET /api/k6/health`
- **Expected:** `{ "status": "ok", "db": "connected", "nats": "connected" }`
- **Interval:** Every 30s
- **Failure threshold:** 3 consecutive failures → restart pod

### Failure Modes
| Failure | Symptom | Recovery |
|---------|---------|----------|
| DB connection lost | 500 on notification send | Auto-reconnect via TypeORM pool; if persistent, restart pod |
| NATS disconnected | Events not received | NATS client auto-reconnects; check NATS cluster health |
| Email provider down | Notifications stuck in `pending` | K7 scheduler retries; check provider status dashboard |
| SMS provider timeout | SMS notifications fail | Retry via K7; fallback to in-app notification |
| Template not found | 500 with "template not found" | Check template registry; redeploy with correct templates |

### Monitoring
- **Metrics:** `k6_notifications_sent_total`, `k6_notification_latency_seconds`, `k6_channel_errors_total`
- **Alerts:** Error rate > 1% for 5 minutes, latency p95 > 5s
- **Logs:** `kubectl logs -f deployment/k6-notification -n rasid`

### Scaling
- Default: 2 replicas
- Scale trigger: Queue depth > 1000 pending notifications
- Max replicas: 10

---

## K7 Scheduler Service

### Deployment
```bash
docker build -t rasid/k7-scheduler:latest --build-arg MODULE=k7-scheduler .
kubectl apply -f infrastructure/kubernetes/k7-scheduler/
kubectl rollout status deployment/k7-scheduler -n rasid
```

### Health Checks
- **Endpoint:** `GET /api/k7/health`
- **Expected:** `{ "status": "ok", "db": "connected", "activeJobs": <count> }`
- **Interval:** Every 30s

### Failure Modes
| Failure | Symptom | Recovery |
|---------|---------|----------|
| DB connection lost | Jobs not picked up | Auto-reconnect; if persistent, restart pod |
| Job execution timeout | Job stuck in `running` | K7 marks as failed after timeout; auto-retry |
| Duplicate job execution | Same job runs twice | Idempotency check via job_id + execution_id |
| Cron parse error | Job not scheduled | Validate cron expression on creation; reject invalid |
| Max retries exceeded | Job marked as `dead` | Manual review required; check dead letter queue |

### Monitoring
- **Metrics:** `k7_jobs_executed_total`, `k7_job_latency_seconds`, `k7_dead_jobs_total`
- **Alerts:** Dead jobs > 0, pickup latency > 30s
- **Logs:** `kubectl logs -f deployment/k7-scheduler -n rasid`

### Important Notes
- K7 MUST NOT execute business logic directly — it only triggers events via K5
- Single-leader election ensures no duplicate job execution across replicas

---

## M5 Departments

### Deployment
```bash
docker build -t rasid/m5-departments:latest --build-arg MODULE=m5-departments .
kubectl apply -f infrastructure/kubernetes/m5-departments/
```

### Health Checks
- **Endpoint:** `GET /api/m5/health`
- **Expected:** `{ "status": "ok", "db": "connected" }`

### Failure Modes
| Failure | Symptom | Recovery |
|---------|---------|----------|
| Circular hierarchy | 500 on department creation | Validate parent_id chain before insert |
| Orphaned departments | Children without parent | Run integrity check: `SELECT * FROM departments WHERE parent_id NOT IN (SELECT id FROM departments)` |
| Path corruption | Tree queries return wrong results | Rebuild paths: trigger path recalculation from root |

### Data Integrity
- `path` column uses materialized path pattern (e.g., `/root/child/grandchild/`)
- Max depth: 10 levels
- Deleting a department with children: blocked (must reassign or delete children first)

---

## M6 Employee Profiles

### Deployment
```bash
docker build -t rasid/m6-employees:latest --build-arg MODULE=m6-employees .
kubectl apply -f infrastructure/kubernetes/m6-employees/
```

### Health Checks
- **Endpoint:** `GET /api/m6/health`
- **Expected:** `{ "status": "ok", "db": "connected" }`

### Failure Modes
| Failure | Symptom | Recovery |
|---------|---------|----------|
| Department reference invalid | Employee created with non-existent dept | Validate via M30 API before insert |
| Duplicate employee_number | 409 Conflict | Unique constraint on (tenant_id, employee_number) |
| Bulk import failure | Partial import | Transaction rollback; retry with corrected data |

### Cross-Module Communication
- M6 communicates with M5 ONLY via K5 Events and M30 registered APIs
- M6 NEVER queries m5_departments_db directly
- Department name is cached locally; updated via `department.updated` event

---

## M7 Attendance

### Deployment
```bash
docker build -t rasid/m7-attendance:latest --build-arg MODULE=m7-attendance .
kubectl apply -f infrastructure/kubernetes/m7-attendance/
```

### Health Checks
- **Endpoint:** `GET /api/m7/health`
- **Expected:** `{ "status": "ok", "db": "connected" }`

### Failure Modes
| Failure | Symptom | Recovery |
|---------|---------|----------|
| Double check-in | 409 Conflict | Unique constraint on (employee_id, date, type='check_in') |
| Check-out without check-in | 400 Bad Request | Validate check-in exists before allowing check-out |
| Scheduled report failure | Report not generated | K7 retries; check K7 dead jobs queue |
| Time zone mismatch | Wrong date attribution | All times stored as UTC; convert on display |

### Scheduled Reports
- Daily attendance summary: triggered by K7 at 23:59 UTC
- Weekly report: triggered by K7 every Sunday at 00:00 UTC
- Reports published via K5 Events for K6 notification delivery

---

## M8 Leave Management

### Deployment
```bash
docker build -t rasid/m8-leave:latest --build-arg MODULE=m8-leave .
kubectl apply -f infrastructure/kubernetes/m8-leave/
```

### Health Checks
- **Endpoint:** `GET /api/m8/health`
- **Expected:** `{ "status": "ok", "db": "connected" }`

### Failure Modes
| Failure | Symptom | Recovery |
|---------|---------|----------|
| Negative balance | Balance goes below 0 | CHECK constraint prevents; 400 returned |
| Concurrent approval race | Double deduction | Optimistic locking on leave_balances (version column) |
| Approval chain broken | Request stuck in pending | Admin override endpoint; escalation after 7 days |
| Balance initialization missing | New employee has no balance | Triggered by `employee.created` event from M6 |

### Leave Types
| Type | Default Annual Days | Carry Over |
|------|-------------------|------------|
| annual | 21 | Up to 5 days |
| sick | 15 | No |
| unpaid | Unlimited | No |
| emergency | 5 | No |

### Approval Workflow
1. Employee submits request → status: `pending`
2. Manager approves/rejects → status: `approved`/`rejected`
3. On approval: balance deducted, K6 notification sent
4. On rejection: K6 notification sent with reason
