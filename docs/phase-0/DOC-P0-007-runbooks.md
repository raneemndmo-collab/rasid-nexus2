# DOC-P0-007: Runbooks — Phase 0

## K1 Auth Gateway

### Deployment
```bash
kubectl rollout restart deployment/rasid-api -n rasid-platform
kubectl rollout status deployment/rasid-api -n rasid-platform
```

### Health Checks
- Liveness: `GET /health` → 200
- Readiness: `GET /health/ready` → 200
- JWKS: `GET /.well-known/jwks` → 200 with keys array

### Failure Modes
| Symptom | Cause | Recovery |
|---------|-------|----------|
| 401 on all requests | JWT secret mismatch | Verify JWT_SECRET env var |
| Token issuance slow (>50ms) | DB connection pool exhausted | Restart pods, check connection count |
| JWKS endpoint 500 | Key generation failure | Check logs, restart service |

### Recovery
```bash
# Force restart
kubectl delete pod -l app=rasid-api -n rasid-platform
# Check logs
kubectl logs -l app=rasid-api -n rasid-platform --tail=100
```

---

## K2 Tenant Isolation

### Health Checks
- Middleware active: Any authenticated request includes `x-tenant-id` header
- RLS active: `SELECT relrowsecurity FROM pg_class WHERE relname = '{table}'`

### Failure Modes
| Symptom | Cause | Recovery |
|---------|-------|----------|
| 403 on all requests | TenantContext middleware crash | Check middleware registration |
| Cross-tenant data leak | RLS disabled | Run RLS verification script |
| Missing tenant_id | JWT payload incomplete | Check K1 token issuance |

### Recovery
```sql
-- Verify RLS on all tables
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';
```

---

## K3 Audit

### Health Checks
- Write test: Execute mutation → verify audit_logs entry
- Query test: `GET /audit?entityType=user` → 200

### Failure Modes
| Symptom | Cause | Recovery |
|---------|-------|----------|
| Missing audit entries | Middleware not applied | Check K3AuditModule.configure() |
| Audit write slow (>5ms) | Table bloat | Run VACUUM ANALYZE audit_logs |
| Audit query timeout | Missing index | Verify indexes on tenant_id, entity_type |

### Recovery
```sql
-- Check audit completeness
SELECT COUNT(*) FROM audit_logs WHERE created_at > NOW() - INTERVAL '1 hour';
-- Vacuum
VACUUM ANALYZE audit_logs;
```

---

## K4 Configuration

### Health Checks
- Cache hit: `GET /config/{key}` < 1ms
- Cache miss: `GET /config/{key}` < 10ms
- Redis: `redis-cli -a {password} ping`

### Failure Modes
| Symptom | Cause | Recovery |
|---------|-------|----------|
| Config reads slow | Redis down | Check Redis connection, restart |
| Stale config values | Cache not invalidated | Manual cache flush |
| Config write fails | DB connection issue | Check PostgreSQL connectivity |

### Recovery
```bash
# Flush Redis cache
redis-cli -a redis_pass FLUSHDB
# Restart Redis
docker restart rasid-redis
```

---

## K5 Event Bus

### Health Checks
- NATS: `curl http://localhost:8222/healthz`
- Event store: `SELECT COUNT(*) FROM events WHERE stored_at > NOW() - INTERVAL '5 minutes'`
- DLQ: `SELECT COUNT(*) FROM dead_letter_queue WHERE processed = false`

### Failure Modes
| Symptom | Cause | Recovery |
|---------|-------|----------|
| Events not delivered | NATS down | Check NATS connection, restart |
| Events in DLQ | Handler failures | Review DLQ entries, fix handler, replay |
| Duplicate processing | Idempotency check failed | Verify event_id uniqueness |
| Schema validation fails | Invalid event payload | Check event schema registry |

### Recovery
```bash
# Check NATS streams
nats stream ls
# Replay DLQ
curl -X POST http://localhost:3000/events/dlq/replay
# Restart NATS
docker restart rasid-nats
```
