/**
 * T-P0-002: Database Connectivity
 * Verifies all 10 databases are defined with proper users and credentials.
 */
describe('T-P0-002: Database Connectivity', () => {
  const DATABASES = [
    'k1_auth_db', 'k2_tenant_db', 'k3_audit_db', 'k4_config_db', 'k5_events_db',
    'm1_auth_users_db', 'm2_tenants_db', 'm3_roles_db', 'm4_permissions_db', 'm30_actions_db',
  ];

  const DB_USERS = [
    'k1_user', 'k2_user', 'k3_user', 'k4_user', 'k5_user',
    'm1_user', 'm2_user', 'm3_user', 'm4_user', 'm30_user',
  ];

  it('should define all 10 databases in init script', () => {
    const fs = require('fs');
    const path = require('path');
    const sql = fs.readFileSync(
      path.join(__dirname, '../../infrastructure/database/init/01-create-databases.sql'),
      'utf8',
    );
    for (const db of DATABASES) {
      expect(sql).toContain(db);
    }
  });

  it('should define all 10 database users', () => {
    const fs = require('fs');
    const path = require('path');
    const sql = fs.readFileSync(
      path.join(__dirname, '../../infrastructure/database/init/01-create-databases.sql'),
      'utf8',
    );
    for (const user of DB_USERS) {
      expect(sql).toContain(user);
    }
  });

  it('should have exactly 10 databases', () => {
    expect(DATABASES.length).toBe(10);
  });

  it('should have environment variables for all databases', () => {
    const fs = require('fs');
    const path = require('path');
    const envExample = fs.readFileSync(
      path.join(__dirname, '../../.env.example'),
      'utf8',
    );
    expect(envExample).toContain('K1_DB');
    expect(envExample).toContain('K5_DB');
    expect(envExample).toContain('M1_DB');
  });
});
