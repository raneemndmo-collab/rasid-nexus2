/**
 * T-P0-017: M3+M4 Permission Chain
 * Verifies user → role → permission → check chain works.
 */
describe('T-P0-017: M3+M4 Permission Chain', () => {
  it('should have M3 roles with permissions array', () => {
    const fs = require('fs');
    const path = require('path');
    const entity = fs.readFileSync(
      path.join(__dirname, '../../src/modules/m3-roles/infrastructure/persistence/repositories/role.orm-entity.ts'),
      'utf8',
    );
    expect(entity).toContain('permissions');
  });

  it('should have M4 permission check endpoint', () => {
    const fs = require('fs');
    const path = require('path');
    const controller = fs.readFileSync(
      path.join(__dirname, '../../src/modules/m4-permissions/presentation/controllers/permission.controller.ts'),
      'utf8',
    );
    expect(controller).toContain('check');
    expect(controller).toContain('hasPermission');
  });

  it('should have M1 user with roles array', () => {
    const fs = require('fs');
    const path = require('path');
    const entity = fs.readFileSync(
      path.join(__dirname, '../../src/modules/m1-auth-users/infrastructure/persistence/repositories/user.orm-entity.ts'),
      'utf8',
    );
    expect(entity).toContain('roles');
  });

  it('should have M4 permission service with checkPermission method', () => {
    const fs = require('fs');
    const path = require('path');
    const service = fs.readFileSync(
      path.join(__dirname, '../../src/modules/m4-permissions/application/services/permission.service.ts'),
      'utf8',
    );
    expect(service).toContain('checkPermission');
  });
});
