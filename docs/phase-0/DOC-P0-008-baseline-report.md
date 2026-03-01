# DOC-P0-008: Performance Baseline Report — Phase 0

## Baseline Targets

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| K1 Token Issuance | < 50ms p95 | Jest performance test with 1000 iterations |
| K1 Token Validation | < 10ms p95 | Jest performance test with 1000 iterations |
| K2 TenantContext Overhead | < 2ms | Middleware timing instrumentation |
| K3 Audit Write Overhead | < 5ms per mutation | Middleware timing instrumentation |
| K4 Config Read (cached) | < 1ms | Redis GET timing |
| K4 Config Read (uncached) | < 10ms | PostgreSQL query timing |
| K5 Event Publish | < 5ms p95 | NATS publish timing |
| K5 Event Delivery | < 100ms p95 | End-to-end event timing |
| M4 Permission Check | < 10ms | Query timing |
| M30 Action Validation | < 3ms per request | Middleware timing |
| E2E Flow (signup→permission) | < 500ms | Integration test timing |
| Load Test p95 (30min sustained) | < 200ms | k6/Artillery load test |

## Drift Registry

Performance baselines are tracked in this document. Any deviation >20% from baseline triggers an investigation.

| Date | Metric | Baseline Value | Status |
|------|--------|---------------|--------|
| 2026-03-01 | K1 Token Issuance p95 | TBD (after load test) | Pending |
| 2026-03-01 | K1 Token Validation p95 | TBD (after load test) | Pending |
| 2026-03-01 | K2 TenantContext Overhead | TBD (after load test) | Pending |
| 2026-03-01 | K3 Audit Write Overhead | TBD (after load test) | Pending |
| 2026-03-01 | K4 Config Read (cached) | TBD (after load test) | Pending |
| 2026-03-01 | K5 Event Publish p95 | TBD (after load test) | Pending |
| 2026-03-01 | Load Test p95 | TBD (after load test) | Pending |

## Load Test Configuration

```yaml
# k6 configuration
scenarios:
  sustained_load:
    executor: constant-vus
    vus: 100
    duration: 30m
    
thresholds:
  http_req_duration:
    - p(95)<200
  http_req_failed:
    - rate<0.001  # <0.1% error rate
```

## Notes

- Baselines will be populated after running the full test suite against the deployed Phase 0 infrastructure
- All timing measurements use high-resolution timestamps (process.hrtime.bigint())
- Network latency is excluded from service-level measurements
