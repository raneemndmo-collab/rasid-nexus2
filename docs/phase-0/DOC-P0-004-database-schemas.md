# DOC-P0-004: Database Schemas — Phase 0

## Overview

Phase 0 provisions 10 PostgreSQL databases, each owned by a dedicated user with RLS enforced on all tables.

## Database Inventory

| # | Database | Owner | Module | Tables |
|---|----------|-------|--------|--------|
| 1 | k1_auth_db | k1_user | K1 Auth | auth_tokens |
| 2 | k2_tenant_db | k2_user | K2 Tenant | (metadata only) |
| 3 | k3_audit_db | k3_user | K3 Audit | audit_logs |
| 4 | k4_config_db | k4_user | K4 Config | configurations |
| 5 | k5_events_db | k5_user | K5 Events | events, event_schemas, dead_letter_queue |
| 6 | m1_auth_users_db | m1_user | M1 Users | users |
| 7 | m2_tenants_db | m2_user | M2 Tenants | tenants |
| 8 | m3_roles_db | m3_user | M3 Roles | roles |
| 9 | m4_permissions_db | m4_user | M4 Permissions | permissions |
| 10 | m30_actions_db | m30_user | M30 Actions | actions |

## Table Schemas

### auth_tokens (K1)
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK, auto-generated |
| user_id | UUID | INDEX |
| tenant_id | UUID | INDEX, RLS |
| token_hash | VARCHAR | UNIQUE, INDEX |
| expires_at | TIMESTAMP | NOT NULL |
| revoked | BOOLEAN | DEFAULT false |
| created_at | TIMESTAMP | DEFAULT now() |

### audit_logs (K3)
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK, auto-generated |
| tenant_id | UUID | INDEX, RLS |
| user_id | UUID | INDEX |
| action | VARCHAR | NOT NULL |
| entity_type | VARCHAR | INDEX |
| entity_id | VARCHAR | INDEX |
| old_value | JSONB | NULLABLE |
| new_value | JSONB | NULLABLE |
| ip_address | VARCHAR | NULLABLE |
| user_agent | VARCHAR | NULLABLE |
| correlation_id | UUID | INDEX |
| created_at | TIMESTAMP | INDEX, DEFAULT now() |

### configurations (K4)
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK, auto-generated |
| tenant_id | UUID | INDEX, RLS |
| key | VARCHAR | INDEX, UNIQUE(tenant_id, key) |
| value | JSONB | NOT NULL |
| description | VARCHAR | NULLABLE |
| type | VARCHAR | DEFAULT 'string' |
| created_at | TIMESTAMP | DEFAULT now() |
| updated_at | TIMESTAMP | DEFAULT now() |

### events (K5)
| Column | Type | Constraints |
|--------|------|-------------|
| event_id | UUID | PK |
| event_type | VARCHAR | INDEX |
| tenant_id | UUID | INDEX |
| correlation_id | UUID | INDEX |
| timestamp | TIMESTAMP | NOT NULL |
| version | INTEGER | NOT NULL |
| payload | JSONB | NOT NULL |
| stored_at | TIMESTAMP | DEFAULT now() |

### event_schemas (K5)
| Column | Type | Constraints |
|--------|------|-------------|
| event_type | VARCHAR | PK |
| schema | JSONB | NOT NULL |
| version | INTEGER | NOT NULL |
| created_at | TIMESTAMP | DEFAULT now() |

### dead_letter_queue (K5)
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| event | JSONB | NOT NULL |
| error | VARCHAR | NOT NULL |
| attempts | INTEGER | NOT NULL |
| processed | BOOLEAN | DEFAULT false |
| created_at | TIMESTAMP | DEFAULT now() |

### users (M1)
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK, auto-generated |
| tenant_id | UUID | INDEX, RLS |
| email | VARCHAR | INDEX, UNIQUE(tenant_id, email) |
| password_hash | VARCHAR | NOT NULL (bcrypt) |
| first_name | VARCHAR | NOT NULL |
| last_name | VARCHAR | NOT NULL |
| is_active | BOOLEAN | DEFAULT true |
| roles | TEXT[] | DEFAULT '{}' |
| created_at | TIMESTAMP | DEFAULT now() |
| updated_at | TIMESTAMP | DEFAULT now() |

### tenants (M2)
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK, auto-generated |
| name | VARCHAR | NOT NULL |
| slug | VARCHAR | UNIQUE, INDEX |
| is_active | BOOLEAN | DEFAULT true |
| plan | VARCHAR | DEFAULT 'basic' |
| settings | JSONB | DEFAULT '{}' |
| created_at | TIMESTAMP | DEFAULT now() |
| updated_at | TIMESTAMP | DEFAULT now() |

### roles (M3)
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK, auto-generated |
| tenant_id | UUID | INDEX, RLS |
| name | VARCHAR | UNIQUE(tenant_id, name) |
| description | VARCHAR | DEFAULT '' |
| permissions | TEXT[] | DEFAULT '{}' |
| is_system | BOOLEAN | DEFAULT false |
| created_at | TIMESTAMP | DEFAULT now() |
| updated_at | TIMESTAMP | DEFAULT now() |

### permissions (M4)
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK, auto-generated |
| tenant_id | UUID | INDEX, RLS |
| code | VARCHAR | INDEX, UNIQUE(tenant_id, code) |
| name | VARCHAR | NOT NULL |
| description | VARCHAR | DEFAULT '' |
| module | VARCHAR | INDEX |
| created_at | TIMESTAMP | DEFAULT now() |
| updated_at | TIMESTAMP | DEFAULT now() |

### actions (M30)
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK, auto-generated |
| code | VARCHAR | UNIQUE, INDEX |
| name | VARCHAR | NOT NULL |
| description | VARCHAR | DEFAULT '' |
| module | VARCHAR | INDEX |
| required_permissions | TEXT[] | DEFAULT '{}' |
| is_active | BOOLEAN | DEFAULT true |
| metadata | JSONB | DEFAULT '{}' |
| created_at | TIMESTAMP | DEFAULT now() |
| updated_at | TIMESTAMP | DEFAULT now() |

## RLS Policy Template

Applied to every table with `tenant_id` column:

```sql
ALTER TABLE {table} ENABLE ROW LEVEL SECURITY;
ALTER TABLE {table} FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON {table}
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

CREATE POLICY tenant_insert ON {table}
  FOR INSERT
  WITH CHECK (tenant_id = current_setting('app.current_tenant_id')::uuid);
```

## Credential Isolation

Each database user can ONLY connect to its own database:
```sql
REVOKE ALL ON DATABASE {db} FROM PUBLIC;
GRANT CONNECT ON DATABASE {db} TO {owner_user};
```
