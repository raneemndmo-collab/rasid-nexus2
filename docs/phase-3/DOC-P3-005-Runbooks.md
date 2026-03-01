# DOC-P3-005: Phase 3 Runbooks

**Version:** 1.0.0  
**Phase:** 3 — Integration & Collaboration  
**Date:** 2026-03-01  

---

## M15 Workflows

### Deployment
```bash
# Database migration
psql -U m15_user -d m15_workflows_db -f migrations/m15-workflows.sql
# Verify tables
psql -U m15_user -d m15_workflows_db -c "\dt"
```

### Health Checks
- `GET /api/v1/workflows/definitions` → 200 OK
- Database: `SELECT COUNT(*) FROM workflow_definitions`
- Execution engine: Create test workflow and verify execution completes

### Failure Modes
| Failure | Symptom | Recovery |
|---------|---------|----------|
| DB connection lost | 500 on all endpoints | Restart DB, verify connection pool |
| Execution stuck | Status remains 'running' > 5min | Check step logs, manually complete/fail |
| Invalid step config | Execution fails immediately | Validate JSON schema before activation |

### Recovery
1. Check PostgreSQL connectivity: `pg_isready -h localhost -d m15_workflows_db`
2. Check execution queue: `SELECT * FROM workflow_executions WHERE status = 'running'`
3. Reset stuck executions: `UPDATE workflow_executions SET status = 'failed' WHERE status = 'running' AND started_at < NOW() - INTERVAL '1 hour'`

---

## M16 Form Builder

### Deployment
```bash
psql -U m16_user -d m16_forms_db -f migrations/m16-forms.sql
```

### Health Checks
- `GET /api/v1/forms/definitions` → 200 OK
- Validation engine: Submit test form with invalid data, expect validation errors

### Failure Modes
| Failure | Symptom | Recovery |
|---------|---------|----------|
| Schema validation error | 400 on submission | Check field definitions JSON |
| FK violation | 500 on submission | Verify form_id exists in definitions |

### Recovery
1. Verify form definitions: `SELECT id, name, status FROM form_definitions WHERE status = 'published'`
2. Check orphaned submissions: `SELECT s.id FROM form_submissions s LEFT JOIN form_definitions d ON s.form_id = d.id WHERE d.id IS NULL`

---

## M17 OCR

### Deployment
```bash
psql -U m17_user -d m17_ocr_db -f migrations/m17-ocr.sql
# Verify M11 AI Engine is available
curl -s http://localhost:3000/api/v1/ai/health
```

### Health Checks
- `GET /api/v1/ocr/jobs` → 200 OK
- AI connectivity: Submit test image, verify text extraction
- M11 dependency: Verify IVisionAnalysis port is injected

### Failure Modes
| Failure | Symptom | Recovery |
|---------|---------|----------|
| M11 AI unavailable | Jobs stuck in 'processing' | Check M11 health, verify API key |
| File too large | 413 or timeout | Check file size limits in config |
| Low confidence | Extracted text quality poor | Verify image quality, adjust prompts |

### Recovery
1. Check M11 status: `GET /api/v1/ai/health`
2. Reset stuck jobs: `UPDATE ocr_jobs SET status = 'failed', error = 'Timeout' WHERE status = 'processing' AND created_at < NOW() - INTERVAL '10 minutes'`
3. Reprocess failed jobs: `POST /api/v1/ocr/jobs/:id/process`

---

## M18 Dashboards

### Deployment
```bash
psql -U m18_user -d m18_dashboards_db -f migrations/m18-dashboards.sql
```

### Health Checks
- `GET /api/v1/dashboards` → 200 OK
- Widget rendering: Create dashboard with 10 widgets, load < 2s
- AI insights: Verify M11 ISummarization integration

### Failure Modes
| Failure | Symptom | Recovery |
|---------|---------|----------|
| Widget data source unavailable | Widget shows error | Check data_source endpoint |
| AI insights timeout | Insights generation hangs | Check M11 budget/rate limits |
| Dashboard load slow | > 2s response time | Check widget count, optimize queries |

### Recovery
1. Check widget data sources: `SELECT DISTINCT data_source FROM widgets`
2. Disable AI insights temporarily: `UPDATE widgets SET ai_insights_enabled = false`

---

## M19 Calendar

### Deployment
```bash
psql -U m19_user -d m19_calendar_db -f migrations/m19-calendar.sql
```

### Health Checks
- `GET /api/v1/calendar/events` → 200 OK
- Date range queries: Verify timezone handling

### Failure Modes
| Failure | Symptom | Recovery |
|---------|---------|----------|
| Timezone mismatch | Events show wrong times | Verify server timezone, use UTC |
| Recurrence loop | Infinite events generated | Cap recurrence expansion |

---

## M20 Messages

### Deployment
```bash
psql -U m20_user -d m20_messages_db -f migrations/m20-messages.sql
```

### Health Checks
- `GET /api/v1/messages/threads` → 200 OK
- Message delivery: Send message, verify it appears in thread

### Failure Modes
| Failure | Symptom | Recovery |
|---------|---------|----------|
| Thread not found | 404 on message send | Verify thread_id exists |
| Large attachment | Slow message load | Check attachment size limits |

---

## M21 Tasks

### Deployment
```bash
psql -U m21_user -d m21_tasks_db -f migrations/m21-tasks.sql
```

### Health Checks
- `GET /api/v1/tasks` → 200 OK
- Status transitions: Verify open → in_progress → done flow

### Failure Modes
| Failure | Symptom | Recovery |
|---------|---------|----------|
| Invalid status transition | 400 on status change | Check allowed transitions |
| Orphaned comments | Comments without task | Clean up via FK cascade |

---

## M22 Projects

### Deployment
```bash
psql -U m22_user -d m22_projects_db -f migrations/m22-projects.sql
```

### Health Checks
- `GET /api/v1/projects` → 200 OK
- Member management: Add/remove members, verify access

### Failure Modes
| Failure | Symptom | Recovery |
|---------|---------|----------|
| Duplicate member | 409 conflict | Check UNIQUE constraint |
| Archive prevents edits | 400 on update | Verify project status before edit |

---

## M23 Collaboration

### Deployment
```bash
psql -U m23_user -d m23_collaboration_db -f migrations/m23-collaboration.sql
```

### Health Checks
- `GET /api/v1/collaboration/sessions` → 200 OK
- OT engine: Submit concurrent changes, verify conflict detection
- Presence: Update presence, verify broadcast

### Failure Modes
| Failure | Symptom | Recovery |
|---------|---------|----------|
| OT conflict unresolved | Changes lost | Check base_version alignment |
| Stale presence | Users shown as active | Clean up stale presence records |
| Session leak | Sessions never close | Auto-close inactive sessions > 1hr |

### Recovery
1. Close stale sessions: `UPDATE collaboration_sessions SET status = 'closed' WHERE status = 'active' AND updated_at < NOW() - INTERVAL '1 hour'`
2. Clean stale presence: `DELETE FROM collaboration_presence WHERE last_seen_at < NOW() - INTERVAL '15 minutes'`
