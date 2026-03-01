# DOC-P1-003: Database Schemas — Phase 1

## k6_notification_db

### notifications
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() |
| tenant_id | UUID | NOT NULL |
| recipient_id | UUID | NOT NULL |
| channel | VARCHAR(20) | NOT NULL (email/sms/push/in_app) |
| subject | VARCHAR(500) | |
| body | TEXT | NOT NULL |
| status | VARCHAR(20) | DEFAULT 'pending' |
| metadata | JSONB | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() |

### notification_preferences
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() |
| tenant_id | UUID | NOT NULL |
| user_id | UUID | NOT NULL |
| channel | VARCHAR(20) | NOT NULL |
| enabled | BOOLEAN | DEFAULT true |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |
| | | UNIQUE(tenant_id, user_id, channel) |

## k7_scheduler_db

### scheduled_jobs
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() |
| tenant_id | UUID | NOT NULL |
| name | VARCHAR(255) | NOT NULL |
| type | VARCHAR(20) | NOT NULL (one_time/recurring) |
| cron_expression | VARCHAR(100) | |
| scheduled_at | TIMESTAMPTZ | |
| handler | VARCHAR(255) | NOT NULL |
| payload | JSONB | |
| status | VARCHAR(20) | DEFAULT 'pending' |
| max_retries | INT | DEFAULT 3 |
| retry_count | INT | DEFAULT 0 |
| timeout_ms | INT | DEFAULT 30000 |
| last_run_at | TIMESTAMPTZ | |
| next_run_at | TIMESTAMPTZ | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() |

### job_execution_log
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() |
| job_id | UUID | FK → scheduled_jobs.id |
| tenant_id | UUID | NOT NULL |
| status | VARCHAR(20) | NOT NULL |
| started_at | TIMESTAMPTZ | NOT NULL |
| completed_at | TIMESTAMPTZ | |
| duration_ms | INT | |
| error | TEXT | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |

## m5_departments_db

### departments
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() |
| tenant_id | UUID | NOT NULL |
| name | VARCHAR(255) | NOT NULL |
| code | VARCHAR(50) | NOT NULL |
| description | TEXT | |
| parent_id | UUID | FK → departments.id |
| manager_id | UUID | |
| is_active | BOOLEAN | DEFAULT true |
| level | INT | DEFAULT 0 |
| path | TEXT | DEFAULT '/' |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() |

## m6_employees_db

### employees
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() |
| tenant_id | UUID | NOT NULL |
| user_id | UUID | NOT NULL |
| employee_number | VARCHAR(50) | UNIQUE, NOT NULL |
| department_id | UUID | NOT NULL |
| position | VARCHAR(255) | NOT NULL |
| hire_date | DATE | NOT NULL |
| status | VARCHAR(20) | DEFAULT 'active' |
| manager_id | UUID | |
| salary | DECIMAL(12,2) | |
| work_schedule | VARCHAR(100) | |
| metadata | JSONB | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() |

## m7_attendance_db

### attendance_records
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() |
| tenant_id | UUID | NOT NULL |
| employee_id | UUID | NOT NULL |
| date | DATE | NOT NULL |
| check_in | TIMESTAMPTZ | |
| check_out | TIMESTAMPTZ | |
| status | VARCHAR(20) | DEFAULT 'present' |
| work_hours | DECIMAL(5,2) | |
| overtime_hours | DECIMAL(5,2) | |
| notes | TEXT | |
| location | JSONB | |
| ip_address | VARCHAR(45) | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() |

## m8_leave_db

### leave_requests
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() |
| tenant_id | UUID | NOT NULL |
| employee_id | UUID | NOT NULL |
| leave_type | VARCHAR(50) | NOT NULL |
| start_date | DATE | NOT NULL |
| end_date | DATE | NOT NULL |
| days | INT | NOT NULL |
| reason | TEXT | NOT NULL |
| status | VARCHAR(20) | DEFAULT 'pending' |
| approved_by | UUID | |
| approved_at | TIMESTAMPTZ | |
| rejection_reason | TEXT | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() |

### leave_balances
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() |
| tenant_id | UUID | NOT NULL |
| employee_id | UUID | NOT NULL |
| leave_type | VARCHAR(50) | NOT NULL |
| year | INT | NOT NULL |
| total_days | DECIMAL(5,1) | NOT NULL |
| used_days | DECIMAL(5,1) | DEFAULT 0 |
| remaining_days | DECIMAL(5,1) | NOT NULL |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() |
| | | UNIQUE(tenant_id, employee_id, leave_type, year) |

## RLS Policy

All tables have Row-Level Security enabled with tenant_id-based policies, consistent with Phase 0.
