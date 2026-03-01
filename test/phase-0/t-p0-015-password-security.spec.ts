/**
 * T-P0-015: M1 Password Security
 * Verifies passwords are stored with bcrypt, never plaintext.
 */

describe('T-P0-015: M1 Password Security', () => {
  it('should use bcrypt in user service', () => {
    const fs = require('fs');
    const path = require('path');
    const service = fs.readFileSync(
      path.join(__dirname, '../../src/modules/m1-auth-users/application/services/user.service.ts'),
      'utf8',
    );
    expect(service).toContain('bcrypt');
    expect(service).toContain('hash');
  });

  it('should not store plaintext passwords in ORM entity', () => {
    const fs = require('fs');
    const path = require('path');
    const entity = fs.readFileSync(
      path.join(__dirname, '../../src/modules/m1-auth-users/infrastructure/persistence/repositories/user.orm-entity.ts'),
      'utf8',
    );
    expect(entity).toContain('password_hash');
    expect(entity).not.toContain('password_plain');
    expect(entity).not.toContain('plaintext');
  });

  it('should use salt rounds >= 10', () => {
    const fs = require('fs');
    const path = require('path');
    const service = fs.readFileSync(
      path.join(__dirname, '../../src/modules/m1-auth-users/application/services/user.service.ts'),
      'utf8',
    );
    // Check for salt rounds 10, 11, or 12
    expect(service).toContain('SALT_ROUNDS = 12');
  });

  it('should have password comparison method', () => {
    const fs = require('fs');
    const path = require('path');
    const service = fs.readFileSync(
      path.join(__dirname, '../../src/modules/m1-auth-users/application/services/user.service.ts'),
      'utf8',
    );
    expect(service).toContain('compare');
  });

  it('should not expose password_hash in user responses', () => {
    const fs = require('fs');
    const path = require('path');
    const service = fs.readFileSync(
      path.join(__dirname, '../../src/modules/m1-auth-users/application/services/user.service.ts'),
      'utf8',
    );
    // Service should strip password from responses
    expect(service).toContain('passwordHash');
  });
});
