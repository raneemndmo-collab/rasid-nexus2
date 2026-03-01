-- ═══════════════════════════════════════════════════════════
-- Rasid Platform — Phase 0+1: Database Initialization
-- 16 PostgreSQL databases with isolated users and RLS
-- ═══════════════════════════════════════════════════════════

-- ─── Create Users ───
CREATE USER k1_user WITH PASSWORD 'k1_pass';
CREATE USER k2_user WITH PASSWORD 'k2_pass';
CREATE USER k3_user WITH PASSWORD 'k3_pass';
CREATE USER k4_user WITH PASSWORD 'k4_pass';
CREATE USER k5_user WITH PASSWORD 'k5_pass';
CREATE USER m1_user WITH PASSWORD 'm1_pass';
CREATE USER m2_user WITH PASSWORD 'm2_pass';
CREATE USER m3_user WITH PASSWORD 'm3_pass';
CREATE USER m4_user WITH PASSWORD 'm4_pass';
CREATE USER m30_user WITH PASSWORD 'm30_pass';

-- ─── Phase 1 Users ───
CREATE USER k6_user WITH PASSWORD 'k6_pass';
CREATE USER k7_user WITH PASSWORD 'k7_pass';
CREATE USER m5_user WITH PASSWORD 'm5_pass';
CREATE USER m6_user WITH PASSWORD 'm6_pass';
CREATE USER m7_user WITH PASSWORD 'm7_pass';
CREATE USER m8_user WITH PASSWORD 'm8_pass';

-- ─── Databases ───
CREATE DATABASE k1_auth_db OWNER k1_user;
CREATE DATABASE k2_tenant_db OWNER k2_user;
CREATE DATABASE k3_audit_db OWNER k3_user;
CREATE DATABASE k4_config_db OWNER k4_user;
CREATE DATABASE k5_events_db OWNER k5_user;
CREATE DATABASE m1_auth_users_db OWNER m1_user;
CREATE DATABASE m2_tenants_db OWNER m2_user;
CREATE DATABASE m3_roles_db OWNER m3_user;
CREATE DATABASE m4_permissions_db OWNER m4_user;
CREATE DATABASE m30_actions_db OWNER m30_user;

-- ─── Phase 1 Databases ───
CREATE DATABASE k6_notification_db OWNER k6_user;
CREATE DATABASE k7_scheduler_db OWNER k7_user;
CREATE DATABASE m5_departments_db OWNER m5_user;
CREATE DATABASE m6_employees_db OWNER m6_user;
CREATE DATABASE m7_attendance_db OWNER m7_user;
CREATE DATABASE m8_leave_db OWNER m8_user;

-- ─── Revoke cross-database access ───
REVOKE ALL ON DATABASE k1_auth_db FROM PUBLIC;
REVOKE ALL ON DATABASE k2_tenant_db FROM PUBLIC;
REVOKE ALL ON DATABASE k3_audit_db FROM PUBLIC;
REVOKE ALL ON DATABASE k4_config_db FROM PUBLIC;
REVOKE ALL ON DATABASE k5_events_db FROM PUBLIC;
REVOKE ALL ON DATABASE m1_auth_users_db FROM PUBLIC;
REVOKE ALL ON DATABASE m2_tenants_db FROM PUBLIC;
REVOKE ALL ON DATABASE m3_roles_db FROM PUBLIC;
REVOKE ALL ON DATABASE m4_permissions_db FROM PUBLIC;
REVOKE ALL ON DATABASE m30_actions_db FROM PUBLIC;
REVOKE ALL ON DATABASE k6_notification_db FROM PUBLIC;
REVOKE ALL ON DATABASE k7_scheduler_db FROM PUBLIC;
REVOKE ALL ON DATABASE m5_departments_db FROM PUBLIC;
REVOKE ALL ON DATABASE m6_employees_db FROM PUBLIC;
REVOKE ALL ON DATABASE m7_attendance_db FROM PUBLIC;
REVOKE ALL ON DATABASE m8_leave_db FROM PUBLIC;

-- Grant connect only to respective owners
GRANT CONNECT ON DATABASE k1_auth_db TO k1_user;
GRANT CONNECT ON DATABASE k2_tenant_db TO k2_user;
GRANT CONNECT ON DATABASE k3_audit_db TO k3_user;
GRANT CONNECT ON DATABASE k4_config_db TO k4_user;
GRANT CONNECT ON DATABASE k5_events_db TO k5_user;
GRANT CONNECT ON DATABASE m1_auth_users_db TO m1_user;
GRANT CONNECT ON DATABASE m2_tenants_db TO m2_user;
GRANT CONNECT ON DATABASE m3_roles_db TO m3_user;
GRANT CONNECT ON DATABASE m4_permissions_db TO m4_user;
GRANT CONNECT ON DATABASE m30_actions_db TO m30_user;
GRANT CONNECT ON DATABASE k6_notification_db TO k6_user;
GRANT CONNECT ON DATABASE k7_scheduler_db TO k7_user;
GRANT CONNECT ON DATABASE m5_departments_db TO m5_user;
GRANT CONNECT ON DATABASE m6_employees_db TO m6_user;
GRANT CONNECT ON DATABASE m7_attendance_db TO m7_user;
GRANT CONNECT ON DATABASE m8_leave_db TO m8_user;
