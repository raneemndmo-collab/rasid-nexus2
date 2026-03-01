-- ═══════════════════════════════════════════════════════════
-- Rasid Platform — RLS Setup Template
-- Applied to each database after table creation
-- ═══════════════════════════════════════════════════════════

-- This script is a template. Each module's migration applies RLS
-- to its own tables using this pattern:

-- Step 1: Enable RLS on table
-- ALTER TABLE {table_name} ENABLE ROW LEVEL SECURITY;

-- Step 2: Force RLS for table owner
-- ALTER TABLE {table_name} FORCE ROW LEVEL SECURITY;

-- Step 3: Create tenant isolation policy
-- CREATE POLICY tenant_isolation ON {table_name}
--   USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- Step 4: Create tenant insert policy
-- CREATE POLICY tenant_insert ON {table_name}
--   FOR INSERT
--   WITH CHECK (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- The current_setting('app.current_tenant_id') is set by K2 TenantContext
-- middleware at the beginning of each database transaction.
