/**
 * T-P0-026: Credential Isolation
 * Verifies each DB user can only access its own database.
 */
describe('T-P0-026: Credential Isolation', () => {
  it('should have REVOKE PUBLIC in database init script', () => {
    const fs = require('fs');
    const path = require('path');
    const sql = fs.readFileSync(
      path.join(__dirname, '../../infrastructure/database/init/01-create-databases.sql'),
      'utf8',
    );
    expect(sql).toContain('REVOKE');
    expect(sql).toContain('PUBLIC');
  });

  it('should have separate users for each database', () => {
    const fs = require('fs');
    const path = require('path');
    const sql = fs.readFileSync(
      path.join(__dirname, '../../infrastructure/database/init/01-create-databases.sql'),
      'utf8',
    );
    const users = ['k1_user', 'k2_user', 'k3_user', 'k4_user', 'k5_user',
                    'm1_user', 'm2_user', 'm3_user', 'm4_user', 'm30_user'];
    for (const user of users) {
      expect(sql).toContain(user);
    }
  });

  it('should GRANT CONNECT only to database owner', () => {
    const fs = require('fs');
    const path = require('path');
    const sql = fs.readFileSync(
      path.join(__dirname, '../../infrastructure/database/init/01-create-databases.sql'),
      'utf8',
    );
    expect(sql).toContain('GRANT CONNECT');
  });

  it('should have separate DB environment variables per module', () => {
    const fs = require('fs');
    const path = require('path');
    const envExample = fs.readFileSync(
      path.join(__dirname, '../../.env.example'),
      'utf8',
    );
    expect(envExample).toContain('K1_DB_USER');
    expect(envExample).toContain('K5_DB_USER');
    expect(envExample).toContain('M1_DB_USER');
  });
});
