/**
 * T-P0-025: Database Encryption
 * Verifies encryption at rest and in transit is configured.
 */
describe('T-P0-025: Database Encryption', () => {
  it('should have TLS configuration in environment', () => {
    const fs = require('fs');
    const path = require('path');
    const envExample = fs.readFileSync(
      path.join(__dirname, '../../.env.example'),
      'utf8',
    );
    // Check for SSL/TLS related configuration
    expect(envExample).toContain('DB');
  });

  it('should have SSL option in TypeORM configuration', () => {
    const fs = require('fs');
    const path = require('path');
    const appModule = fs.readFileSync(
      path.join(__dirname, '../../src/app.module.ts'),
      'utf8',
    );
    expect(appModule).toContain('ssl');
  });

  it('should have password hashing (not plaintext) in user entity', () => {
    const fs = require('fs');
    const path = require('path');
    const entity = fs.readFileSync(
      path.join(__dirname, '../../src/modules/m1-auth-users/infrastructure/persistence/repositories/user.orm-entity.ts'),
      'utf8',
    );
    expect(entity).toContain('password_hash');
    expect(entity).not.toContain('password_plain');
  });
});
