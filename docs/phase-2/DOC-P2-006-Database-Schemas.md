# DOC-P2-006: Database Schemas — Phase 2

**Version:** 1.0.0  
**Phase:** 2  
**Generated:** 2026-03-01  

---

## Overview

Phase 2 adds 9 new PostgreSQL databases (K8-K10, M9-M14) to the existing 16 from Phase 0+1, bringing the total to 25 isolated databases. Each database has its own dedicated user with restricted permissions.

---

## K8: k8_storage_db

**User:** k8_user

### stored_objects
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | Primary key |
| tenant_id | UUID | NOT NULL | — | Tenant identifier |
| bucket | VARCHAR(100) | NOT NULL | — | Storage bucket |
| key | VARCHAR(500) | NOT NULL | — | Object key |
| size | BIGINT | — | 0 | Size in bytes |
| content_type | VARCHAR(100) | — | — | MIME type |
| checksum | VARCHAR(64) | — | — | SHA-256 hash |
| metadata | JSONB | — | — | Custom metadata |
| created_at | TIMESTAMPTZ | — | NOW() | Creation time |
| updated_at | TIMESTAMPTZ | — | NOW() | Last update |

**Indexes:** PK on id, UNIQUE on (tenant_id, bucket, key)

---

## K9: k9_monitoring_db

**User:** k9_user

### metric_records
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | Primary key |
| tenant_id | UUID | NOT NULL | — | Tenant identifier |
| name | VARCHAR(200) | NOT NULL | — | Metric name |
| value | DOUBLE PRECISION | NOT NULL | — | Metric value |
| labels | JSONB | — | — | Key-value labels |
| recorded_at | TIMESTAMPTZ | — | NOW() | Recording time |

### alert_rules
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | Primary key |
| tenant_id | UUID | NOT NULL | — | Tenant identifier |
| name | VARCHAR(200) | NOT NULL | — | Alert name |
| metric_name | VARCHAR(200) | NOT NULL | — | Metric to monitor |
| condition | VARCHAR(10) | NOT NULL | — | gt, lt, eq |
| threshold | DOUBLE PRECISION | NOT NULL | — | Threshold value |
| channel | VARCHAR(50) | NOT NULL | — | Notification channel |
| enabled | BOOLEAN | — | true | Active flag |
| created_at | TIMESTAMPTZ | — | NOW() | Creation time |

### health_checks
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | Primary key |
| service | VARCHAR(100) | NOT NULL | — | Service name |
| status | VARCHAR(20) | — | 'healthy' | Health status |
| details | JSONB | — | — | Check details |
| checked_at | TIMESTAMPTZ | — | NOW() | Check time |

---

## K10: k10_registry_db

**User:** k10_user

### service_registrations
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | Primary key |
| name | VARCHAR(100) | NOT NULL | — | Service name |
| version | VARCHAR(20) | NOT NULL | — | Service version |
| host | VARCHAR(200) | NOT NULL | — | Service host |
| port | INTEGER | NOT NULL | — | Service port |
| status | VARCHAR(20) | — | 'active' | Registration status |
| metadata | JSONB | — | — | Service metadata |
| registered_at | TIMESTAMPTZ | — | NOW() | Registration time |
| last_heartbeat | TIMESTAMPTZ | — | NOW() | Last heartbeat |

---

## M9: m9_payroll_db

**User:** m9_user

### payroll_runs
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | Primary key |
| tenant_id | UUID | NOT NULL | — | Tenant identifier |
| period | VARCHAR(7) | NOT NULL | — | Pay period (YYYY-MM) |
| status | VARCHAR(20) | NOT NULL | 'draft' | Run status |
| total_gross | DECIMAL(15,2) | — | 0 | Total gross pay |
| total_deductions | DECIMAL(15,2) | — | 0 | Total deductions |
| total_net | DECIMAL(15,2) | — | 0 | Total net pay |
| employee_count | INTEGER | — | 0 | Employees in run |
| approved_by | UUID | — | — | Approver |
| created_at | TIMESTAMPTZ | — | NOW() | Creation time |

### payroll_items
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | Primary key |
| tenant_id | UUID | NOT NULL | — | Tenant identifier |
| run_id | UUID | NOT NULL | — | FK to payroll_runs |
| employee_id | UUID | NOT NULL | — | Employee reference |
| basic_salary | DECIMAL(15,2) | NOT NULL | — | Basic salary |
| housing | DECIMAL(15,2) | — | 0 | Housing allowance |
| transport | DECIMAL(15,2) | — | 0 | Transport allowance |
| gosi_employee | DECIMAL(15,2) | — | 0 | GOSI employee share |
| gosi_employer | DECIMAL(15,2) | — | 0 | GOSI employer share |
| deductions | DECIMAL(15,2) | — | 0 | Other deductions |
| net | DECIMAL(15,2) | NOT NULL | — | Net pay |

### salary_structures
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | Primary key |
| tenant_id | UUID | NOT NULL | — | Tenant identifier |
| name | VARCHAR(200) | NOT NULL | — | Structure name |
| components | JSONB | NOT NULL | — | Salary components |
| gosi_rate_employee | DECIMAL(5,4) | — | 0.0975 | GOSI employee rate |
| gosi_rate_employer | DECIMAL(5,4) | — | 0.1175 | GOSI employer rate |
| created_at | TIMESTAMPTZ | — | NOW() | Creation time |

---

## M10: m10_settings_db

**User:** m10_user

### settings
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | Primary key |
| tenant_id | UUID | NOT NULL | — | Tenant identifier |
| key | VARCHAR(200) | NOT NULL | — | Setting key |
| value | TEXT | NOT NULL | — | Setting value |
| scope | VARCHAR(50) | NOT NULL | 'global' | Scope level |
| scope_id | UUID | — | — | Scope entity ID |
| encrypted | BOOLEAN | — | false | Is value encrypted |
| created_at | TIMESTAMPTZ | — | NOW() | Creation time |
| updated_at | TIMESTAMPTZ | — | NOW() | Last update |

### setting_history
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | Primary key |
| setting_id | UUID | NOT NULL | — | FK to settings |
| old_value | TEXT | — | — | Previous value |
| new_value | TEXT | NOT NULL | — | New value |
| changed_by | UUID | NOT NULL | — | Who changed it |
| changed_at | TIMESTAMPTZ | — | NOW() | When changed |

---

## M11: m11_ai_db

**User:** m11_user

### ai_models
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | Primary key |
| tenant_id | UUID | NOT NULL | — | Tenant identifier |
| name | VARCHAR(200) | NOT NULL | — | Model display name |
| provider | VARCHAR(100) | NOT NULL | — | Provider name |
| model_id | VARCHAR(200) | NOT NULL | — | Provider model ID |
| capabilities | TEXT[] | — | '{}' | Supported capabilities |
| config | JSONB | — | — | Model configuration |
| active | BOOLEAN | — | true | Is model active |
| created_at | TIMESTAMPTZ | — | NOW() | Creation time |

### ai_prompts
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | Primary key |
| tenant_id | UUID | NOT NULL | — | Tenant identifier |
| name | VARCHAR(200) | NOT NULL | — | Prompt name |
| capability | VARCHAR(50) | NOT NULL | — | Target capability |
| system_prompt | TEXT | — | — | System instruction |
| user_template | TEXT | NOT NULL | — | User prompt template |
| version | VARCHAR(20) | NOT NULL | '1.0' | Prompt version |
| active | BOOLEAN | — | true | Is prompt active |
| created_at | TIMESTAMPTZ | — | NOW() | Creation time |

### ai_usage_logs
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | Primary key |
| tenant_id | UUID | NOT NULL | — | Tenant identifier |
| capability | VARCHAR(50) | NOT NULL | — | Capability used |
| model | VARCHAR(200) | — | — | Model used |
| input_tokens | INTEGER | — | 0 | Input token count |
| output_tokens | INTEGER | — | 0 | Output token count |
| latency_ms | INTEGER | — | — | Response latency |
| cost_usd | DECIMAL(10,6) | — | 0 | Estimated cost |
| status | VARCHAR(20) | NOT NULL | — | success/error/fallback |
| provider_level | INTEGER | — | 0 | Fallback level used |
| error_message | TEXT | — | — | Error details |
| created_at | TIMESTAMPTZ | — | NOW() | Creation time |

---

## M12: m12_notifications_db

**User:** m12_user

### user_notifications
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | Primary key |
| tenant_id | UUID | NOT NULL | — | Tenant identifier |
| user_id | UUID | NOT NULL | — | Recipient user |
| title | VARCHAR(500) | NOT NULL | — | Notification title |
| body | TEXT | NOT NULL | — | Notification body |
| type | VARCHAR(50) | NOT NULL | — | Notification type |
| priority | VARCHAR(20) | — | 'medium' | Priority level |
| status | VARCHAR(20) | — | 'unread' | Read status |
| source_module | VARCHAR(50) | — | — | Originating module |
| source_id | UUID | — | — | Source entity ID |
| action_url | TEXT | — | — | Action link |
| metadata | JSONB | — | — | Extra data |
| read_at | TIMESTAMPTZ | — | — | When read |
| created_at | TIMESTAMPTZ | — | NOW() | Creation time |
| updated_at | TIMESTAMPTZ | — | NOW() | Last update |

### notification_subscriptions
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | Primary key |
| tenant_id | UUID | NOT NULL | — | Tenant identifier |
| user_id | UUID | NOT NULL | — | Subscriber |
| topic | VARCHAR(200) | NOT NULL | — | Subscription topic |
| channel | VARCHAR(50) | — | 'in_app' | Delivery channel |
| active | BOOLEAN | — | true | Is active |
| created_at | TIMESTAMPTZ | — | NOW() | Creation time |

---

## M13: m13_files_db

**User:** m13_user

### managed_files
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | Primary key |
| tenant_id | UUID | NOT NULL | — | Tenant identifier |
| storage_object_id | UUID | NOT NULL | — | FK to K8 stored_objects |
| name | VARCHAR(500) | NOT NULL | — | Display name |
| original_name | VARCHAR(500) | NOT NULL | — | Original filename |
| mime_type | VARCHAR(100) | NOT NULL | — | MIME type |
| size | BIGINT | NOT NULL | — | File size |
| folder_id | UUID | — | — | Parent folder |
| tags | TEXT[] | — | '{}' | File tags |
| thumbnail_id | UUID | — | — | Thumbnail reference |
| status | VARCHAR(20) | — | 'active' | File status |
| uploaded_by | UUID | NOT NULL | — | Uploader |
| metadata | JSONB | — | — | Extra metadata |
| created_at | TIMESTAMPTZ | — | NOW() | Upload time |
| updated_at | TIMESTAMPTZ | — | NOW() | Last update |

### folders
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | Primary key |
| tenant_id | UUID | NOT NULL | — | Tenant identifier |
| name | VARCHAR(200) | NOT NULL | — | Folder name |
| parent_id | UUID | — | — | Parent folder |
| created_by | UUID | NOT NULL | — | Creator |
| created_at | TIMESTAMPTZ | — | NOW() | Creation time |

### file_shares
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | Primary key |
| tenant_id | UUID | NOT NULL | — | Tenant identifier |
| file_id | UUID | NOT NULL | — | FK to managed_files |
| shared_with | UUID | NOT NULL | — | Recipient user |
| permission | VARCHAR(20) | — | 'read' | Permission level |
| expires_at | TIMESTAMPTZ | — | — | Expiration |
| created_at | TIMESTAMPTZ | — | NOW() | Share time |

---

## M14: m14_reports_db

**User:** m14_user

### report_definitions
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | Primary key |
| tenant_id | UUID | NOT NULL | — | Tenant identifier |
| name | VARCHAR(200) | NOT NULL | — | Report name |
| module | VARCHAR(50) | NOT NULL | — | Source module |
| query_template | TEXT | NOT NULL | — | Query template |
| parameters | JSONB | — | — | Report parameters |
| created_by | UUID | NOT NULL | — | Creator |
| created_at | TIMESTAMPTZ | — | NOW() | Creation time |

### report_executions
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | Primary key |
| tenant_id | UUID | NOT NULL | — | Tenant identifier |
| definition_id | UUID | NOT NULL | — | FK to definitions |
| status | VARCHAR(20) | NOT NULL | 'pending' | Execution status |
| result_data | JSONB | — | — | Report output |
| ai_summary | TEXT | — | — | AI-generated summary |
| row_count | INTEGER | — | 0 | Result rows |
| executed_by | UUID | NOT NULL | — | Executor |
| started_at | TIMESTAMPTZ | — | NOW() | Start time |
| completed_at | TIMESTAMPTZ | — | — | Completion time |

### report_schedules
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | Primary key |
| tenant_id | UUID | NOT NULL | — | Tenant identifier |
| definition_id | UUID | NOT NULL | — | FK to definitions |
| cron_expression | VARCHAR(100) | NOT NULL | — | Cron schedule |
| recipients | UUID[] | — | '{}' | Email recipients |
| active | BOOLEAN | — | true | Is active |
| last_run | TIMESTAMPTZ | — | — | Last execution |
| created_at | TIMESTAMPTZ | — | NOW() | Creation time |

---

## Database Summary

| Phase | Databases | Tables | Total |
|-------|-----------|--------|-------|
| Phase 0 | 10 (K1-K5, M1-M4, M30) | ~20 | 20 |
| Phase 1 | 6 (K6-K7, M5-M8) | ~12 | 32 |
| Phase 2 | 9 (K8-K10, M9-M14) | 22 | 54 |
| **Total** | **25** | **~54** | **54** |
