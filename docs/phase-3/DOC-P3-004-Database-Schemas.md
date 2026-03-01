# DOC-P3-004: Phase 3 Database Schemas

**Version:** 1.0.0  
**Phase:** 3 — Integration & Collaboration  
**Date:** 2026-03-01  

---

## m15_workflows_db

### workflow_definitions
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NOT NULL | gen_random_uuid() |
| tenant_id | uuid | NOT NULL | |
| name | varchar(255) | NOT NULL | |
| description | text | | |
| version | integer | NOT NULL | 1 |
| status | varchar(50) | NOT NULL | 'draft' |
| trigger_type | varchar(50) | NOT NULL | 'manual' |
| steps | jsonb | NOT NULL | '[]' |
| created_by | uuid | NOT NULL | |
| created_at | timestamptz | NOT NULL | now() |
| updated_at | timestamptz | NOT NULL | now() |

### workflow_executions
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NOT NULL | gen_random_uuid() |
| tenant_id | uuid | NOT NULL | |
| definition_id | uuid | NOT NULL | FK→workflow_definitions |
| status | varchar(50) | NOT NULL | 'pending' |
| current_step | integer | NOT NULL | 0 |
| context | jsonb | NOT NULL | '{}' |
| started_at | timestamptz | NOT NULL | now() |
| completed_at | timestamptz | | |
| error | text | | |

---

## m16_forms_db

### form_definitions
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NOT NULL | gen_random_uuid() |
| tenant_id | uuid | NOT NULL | |
| name | varchar(255) | NOT NULL | |
| description | text | | |
| version | integer | NOT NULL | 1 |
| status | varchar(50) | NOT NULL | 'draft' |
| fields | jsonb | NOT NULL | '[]' |
| validation_rules | jsonb | NOT NULL | '[]' |
| created_by | uuid | NOT NULL | |
| created_at | timestamptz | NOT NULL | now() |
| updated_at | timestamptz | NOT NULL | now() |

### form_submissions
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NOT NULL | gen_random_uuid() |
| tenant_id | uuid | NOT NULL | |
| form_id | uuid | NOT NULL | FK→form_definitions |
| submitted_by | uuid | NOT NULL | |
| data | jsonb | NOT NULL | '{}' |
| validation_status | varchar(50) | NOT NULL | 'valid' |
| validation_errors | jsonb | | |
| submitted_at | timestamptz | NOT NULL | now() |

---

## m17_ocr_db

### ocr_jobs
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NOT NULL | gen_random_uuid() |
| tenant_id | uuid | NOT NULL | |
| file_name | varchar(500) | NOT NULL | |
| file_url | text | NOT NULL | |
| status | varchar(50) | NOT NULL | 'pending' |
| extracted_text | text | | |
| tables | jsonb | | |
| layout_analysis | jsonb | | |
| confidence | decimal(5,4) | | |
| ai_request_id | varchar(255) | | |
| processing_time_ms | integer | | |
| error | text | | |
| created_by | uuid | NOT NULL | |
| created_at | timestamptz | NOT NULL | now() |
| completed_at | timestamptz | | |

---

## m18_dashboards_db

### dashboards
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NOT NULL | gen_random_uuid() |
| tenant_id | uuid | NOT NULL | |
| name | varchar(255) | NOT NULL | |
| description | text | | |
| layout | jsonb | NOT NULL | '{}' |
| is_default | boolean | NOT NULL | false |
| created_by | uuid | NOT NULL | |
| created_at | timestamptz | NOT NULL | now() |
| updated_at | timestamptz | NOT NULL | now() |

### widgets
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NOT NULL | gen_random_uuid() |
| tenant_id | uuid | NOT NULL | |
| dashboard_id | uuid | NOT NULL | FK→dashboards (CASCADE) |
| type | varchar(100) | NOT NULL | |
| title | varchar(255) | NOT NULL | |
| config | jsonb | NOT NULL | '{}' |
| data_source | varchar(255) | NOT NULL | |
| position | jsonb | NOT NULL | '{"x":0,"y":0,"w":4,"h":3}' |
| refresh_interval_seconds | integer | | 300 |
| ai_insights_enabled | boolean | NOT NULL | false |
| created_at | timestamptz | NOT NULL | now() |
| updated_at | timestamptz | NOT NULL | now() |

---

## m19_calendar_db

### calendar_events
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NOT NULL | gen_random_uuid() |
| tenant_id | uuid | NOT NULL | |
| title | varchar(255) | NOT NULL | |
| description | text | | |
| start_date | timestamptz | NOT NULL | |
| end_date | timestamptz | NOT NULL | |
| all_day | boolean | NOT NULL | false |
| recurrence | varchar(50) | | |
| location | varchar(500) | | |
| attendees | jsonb | NOT NULL | '[]' |
| created_by | uuid | NOT NULL | |
| created_at | timestamptz | NOT NULL | now() |
| updated_at | timestamptz | NOT NULL | now() |

---

## m20_messages_db

### message_threads
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NOT NULL | gen_random_uuid() |
| tenant_id | uuid | NOT NULL | |
| subject | varchar(500) | NOT NULL | |
| participants | jsonb | NOT NULL | '[]' |
| created_by | uuid | NOT NULL | |
| created_at | timestamptz | NOT NULL | now() |
| updated_at | timestamptz | NOT NULL | now() |

### messages
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NOT NULL | gen_random_uuid() |
| tenant_id | uuid | NOT NULL | |
| thread_id | uuid | NOT NULL | FK→message_threads (CASCADE) |
| sender_id | uuid | NOT NULL | |
| body | text | NOT NULL | |
| attachments | jsonb | | '[]' |
| created_at | timestamptz | NOT NULL | now() |
| updated_at | timestamptz | NOT NULL | now() |

---

## m21_tasks_db

### tasks
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NOT NULL | gen_random_uuid() |
| tenant_id | uuid | NOT NULL | |
| title | varchar(500) | NOT NULL | |
| description | text | | |
| status | varchar(50) | NOT NULL | 'open' |
| priority | varchar(20) | NOT NULL | 'medium' |
| assignee_id | uuid | | |
| due_date | timestamptz | | |
| tags | jsonb | NOT NULL | '[]' |
| created_by | uuid | NOT NULL | |
| created_at | timestamptz | NOT NULL | now() |
| updated_at | timestamptz | NOT NULL | now() |

### task_comments
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NOT NULL | gen_random_uuid() |
| tenant_id | uuid | NOT NULL | |
| task_id | uuid | NOT NULL | FK→tasks (CASCADE) |
| author_id | uuid | NOT NULL | |
| body | text | NOT NULL | |
| created_at | timestamptz | NOT NULL | now() |

---

## m22_projects_db

### projects
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NOT NULL | gen_random_uuid() |
| tenant_id | uuid | NOT NULL | |
| name | varchar(255) | NOT NULL | |
| description | text | | |
| status | varchar(50) | NOT NULL | 'active' |
| start_date | date | | |
| end_date | date | | |
| created_by | uuid | NOT NULL | |
| created_at | timestamptz | NOT NULL | now() |
| updated_at | timestamptz | NOT NULL | now() |

### project_members
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NOT NULL | gen_random_uuid() |
| tenant_id | uuid | NOT NULL | |
| project_id | uuid | NOT NULL | FK→projects (CASCADE) |
| user_id | uuid | NOT NULL | |
| role | varchar(50) | NOT NULL | 'member' |
| joined_at | timestamptz | NOT NULL | now() |

---

## m23_collaboration_db

### collaboration_sessions
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NOT NULL | gen_random_uuid() |
| tenant_id | uuid | NOT NULL | |
| document_id | uuid | NOT NULL | |
| document_type | varchar(100) | NOT NULL | |
| status | varchar(50) | NOT NULL | 'active' |
| current_version | integer | NOT NULL | 0 |
| created_by | uuid | NOT NULL | |
| created_at | timestamptz | NOT NULL | now() |
| updated_at | timestamptz | NOT NULL | now() |

### collaboration_changes
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NOT NULL | gen_random_uuid() |
| tenant_id | uuid | NOT NULL | |
| session_id | uuid | NOT NULL | FK→collaboration_sessions (CASCADE) |
| user_id | uuid | NOT NULL | |
| operation_type | varchar(50) | NOT NULL | |
| path | text | NOT NULL | |
| value | jsonb | | |
| base_version | integer | NOT NULL | |
| applied_version | integer | NOT NULL | |
| created_at | timestamptz | NOT NULL | now() |

### collaboration_presence
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NOT NULL | gen_random_uuid() |
| tenant_id | uuid | NOT NULL | |
| session_id | uuid | NOT NULL | FK→collaboration_sessions (CASCADE) |
| user_id | uuid | NOT NULL | |
| status | varchar(50) | NOT NULL | 'active' |
| cursor_position | jsonb | | |
| last_seen_at | timestamptz | NOT NULL | now() |

---

## Summary

| Database | Tables | Indexes | Foreign Keys |
|----------|--------|---------|-------------|
| m15_workflows_db | 2 | 3 | 1 |
| m16_forms_db | 2 | 3 | 1 |
| m17_ocr_db | 1 | 2 | 0 |
| m18_dashboards_db | 2 | 3 | 1 |
| m19_calendar_db | 1 | 2 | 0 |
| m20_messages_db | 2 | 3 | 1 |
| m21_tasks_db | 2 | 3 | 1 |
| m22_projects_db | 2 | 3 | 1 |
| m23_collaboration_db | 3 | 4 | 2 |
| **Total** | **17** | **26** | **8** |
