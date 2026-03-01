-- ═══════════════════════════════════════════════════════════
-- Rasid Platform — Phase 0+1+2+3: Database Initialization
-- 34 PostgreSQL databases with isolated users and RLS
-- ═══════════════════════════════════════════════════════════

-- ─── Admin Role ───
CREATE ROLE rasid_admin WITH LOGIN SUPERUSER PASSWORD 'rasid_super_secret';

-- ─── Phase 0 Users ───
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

-- ─── Phase 2 Users ───
CREATE USER k8_user WITH PASSWORD 'k8_pass';
CREATE USER k9_user WITH PASSWORD 'k9_pass';
CREATE USER k10_user WITH PASSWORD 'k10_pass';
CREATE USER m9_user WITH PASSWORD 'm9_pass';
CREATE USER m10_user WITH PASSWORD 'm10_pass';
CREATE USER m11_user WITH PASSWORD 'm11_pass';
CREATE USER m12_user WITH PASSWORD 'm12_pass';
CREATE USER m13_user WITH PASSWORD 'm13_pass';
CREATE USER m14_user WITH PASSWORD 'm14_pass';

-- ─── Phase 3 Users ───
CREATE USER m15_user WITH PASSWORD 'm15_pass';
CREATE USER m16_user WITH PASSWORD 'm16_pass';
CREATE USER m17_user WITH PASSWORD 'm17_pass';
CREATE USER m18_user WITH PASSWORD 'm18_pass';
CREATE USER m19_user WITH PASSWORD 'm19_pass';
CREATE USER m20_user WITH PASSWORD 'm20_pass';
CREATE USER m21_user WITH PASSWORD 'm21_pass';
CREATE USER m22_user WITH PASSWORD 'm22_pass';
CREATE USER m23_user WITH PASSWORD 'm23_pass';

-- ─── Phase 0 Databases ───
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

-- ─── Phase 2 Databases ───
CREATE DATABASE k8_storage_db OWNER k8_user;
CREATE DATABASE k9_monitoring_db OWNER k9_user;
CREATE DATABASE k10_registry_db OWNER k10_user;
CREATE DATABASE m9_payroll_db OWNER m9_user;
CREATE DATABASE m10_settings_db OWNER m10_user;
CREATE DATABASE m11_ai_db OWNER m11_user;
CREATE DATABASE m12_notifications_db OWNER m12_user;
CREATE DATABASE m13_files_db OWNER m13_user;
CREATE DATABASE m14_reports_db OWNER m14_user;

-- ─── Phase 3 Databases ───
CREATE DATABASE m15_workflows_db OWNER m15_user;
CREATE DATABASE m16_forms_db OWNER m16_user;
CREATE DATABASE m17_ocr_db OWNER m17_user;
CREATE DATABASE m18_dashboards_db OWNER m18_user;
CREATE DATABASE m19_calendar_db OWNER m19_user;
CREATE DATABASE m20_messages_db OWNER m20_user;
CREATE DATABASE m21_tasks_db OWNER m21_user;
CREATE DATABASE m22_projects_db OWNER m22_user;
CREATE DATABASE m23_collaboration_db OWNER m23_user;

-- ─── Revoke cross-database access (Phase 0) ───
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

-- ─── Revoke cross-database access (Phase 1) ───
REVOKE ALL ON DATABASE k6_notification_db FROM PUBLIC;
REVOKE ALL ON DATABASE k7_scheduler_db FROM PUBLIC;
REVOKE ALL ON DATABASE m5_departments_db FROM PUBLIC;
REVOKE ALL ON DATABASE m6_employees_db FROM PUBLIC;
REVOKE ALL ON DATABASE m7_attendance_db FROM PUBLIC;
REVOKE ALL ON DATABASE m8_leave_db FROM PUBLIC;

-- ─── Revoke cross-database access (Phase 2) ───
REVOKE ALL ON DATABASE k8_storage_db FROM PUBLIC;
REVOKE ALL ON DATABASE k9_monitoring_db FROM PUBLIC;
REVOKE ALL ON DATABASE k10_registry_db FROM PUBLIC;
REVOKE ALL ON DATABASE m9_payroll_db FROM PUBLIC;
REVOKE ALL ON DATABASE m10_settings_db FROM PUBLIC;
REVOKE ALL ON DATABASE m11_ai_db FROM PUBLIC;
REVOKE ALL ON DATABASE m12_notifications_db FROM PUBLIC;
REVOKE ALL ON DATABASE m13_files_db FROM PUBLIC;
REVOKE ALL ON DATABASE m14_reports_db FROM PUBLIC;

-- ─── Revoke cross-database access (Phase 3) ───
REVOKE ALL ON DATABASE m15_workflows_db FROM PUBLIC;
REVOKE ALL ON DATABASE m16_forms_db FROM PUBLIC;
REVOKE ALL ON DATABASE m17_ocr_db FROM PUBLIC;
REVOKE ALL ON DATABASE m18_dashboards_db FROM PUBLIC;
REVOKE ALL ON DATABASE m19_calendar_db FROM PUBLIC;
REVOKE ALL ON DATABASE m20_messages_db FROM PUBLIC;
REVOKE ALL ON DATABASE m21_tasks_db FROM PUBLIC;
REVOKE ALL ON DATABASE m22_projects_db FROM PUBLIC;
REVOKE ALL ON DATABASE m23_collaboration_db FROM PUBLIC;

-- ─── Grant connect (Phase 0) ───
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

-- ─── Grant connect (Phase 1) ───
GRANT CONNECT ON DATABASE k6_notification_db TO k6_user;
GRANT CONNECT ON DATABASE k7_scheduler_db TO k7_user;
GRANT CONNECT ON DATABASE m5_departments_db TO m5_user;
GRANT CONNECT ON DATABASE m6_employees_db TO m6_user;
GRANT CONNECT ON DATABASE m7_attendance_db TO m7_user;
GRANT CONNECT ON DATABASE m8_leave_db TO m8_user;

-- ─── Grant connect (Phase 2) ───
GRANT CONNECT ON DATABASE k8_storage_db TO k8_user;
GRANT CONNECT ON DATABASE k9_monitoring_db TO k9_user;
GRANT CONNECT ON DATABASE k10_registry_db TO k10_user;
GRANT CONNECT ON DATABASE m9_payroll_db TO m9_user;
GRANT CONNECT ON DATABASE m10_settings_db TO m10_user;
GRANT CONNECT ON DATABASE m11_ai_db TO m11_user;
GRANT CONNECT ON DATABASE m12_notifications_db TO m12_user;
GRANT CONNECT ON DATABASE m13_files_db TO m13_user;
GRANT CONNECT ON DATABASE m14_reports_db TO m14_user;

-- ─── Grant connect (Phase 3) ───
GRANT CONNECT ON DATABASE m15_workflows_db TO m15_user;
GRANT CONNECT ON DATABASE m16_forms_db TO m16_user;
GRANT CONNECT ON DATABASE m17_ocr_db TO m17_user;
GRANT CONNECT ON DATABASE m18_dashboards_db TO m18_user;
GRANT CONNECT ON DATABASE m19_calendar_db TO m19_user;
GRANT CONNECT ON DATABASE m20_messages_db TO m20_user;
GRANT CONNECT ON DATABASE m21_tasks_db TO m21_user;
GRANT CONNECT ON DATABASE m22_projects_db TO m22_user;
GRANT CONNECT ON DATABASE m23_collaboration_db TO m23_user;
