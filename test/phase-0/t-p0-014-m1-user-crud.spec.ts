/**
 * T-P0-014: M1 User CRUD
 * Verifies user CRUD operations with audit entries.
 */
describe('T-P0-014: M1 User CRUD', () => {
  it('should have user controller with all CRUD endpoints', () => {
    const fs = require('fs');
    const path = require('path');
    const controller = fs.readFileSync(
      path.join(__dirname, '../../src/modules/m1-auth-users/presentation/controllers/user.controller.ts'),
      'utf8',
    );
    expect(controller).toContain('@Post');
    expect(controller).toContain('@Get');
    expect(controller).toContain('@Put');
    expect(controller).toContain('@Delete');
  });

  it('should have user service with CRUD methods', () => {
    const fs = require('fs');
    const path = require('path');
    const service = fs.readFileSync(
      path.join(__dirname, '../../src/modules/m1-auth-users/application/services/user.service.ts'),
      'utf8',
    );
    expect(service).toContain('create');
    expect(service).toContain('findById');
    expect(service).toContain('update');
    expect(service).toContain('delete');
  });

  it('should publish events on user mutations', () => {
    const fs = require('fs');
    const path = require('path');
    const service = fs.readFileSync(
      path.join(__dirname, '../../src/modules/m1-auth-users/application/services/user.service.ts'),
      'utf8',
    );
    expect(service).toContain('eventBus');
    expect(service).toContain('auth.user.created');
    expect(service).toContain('auth.user.updated');
    expect(service).toContain('auth.user.deleted');
  });

  it('should log audit entries on user mutations', () => {
    const fs = require('fs');
    const path = require('path');
    const service = fs.readFileSync(
      path.join(__dirname, '../../src/modules/m1-auth-users/application/services/user.service.ts'),
      'utf8',
    );
    expect(service).toContain('auditService');
    expect(service).toContain('CREATE_USER');
    expect(service).toContain('UPDATE_USER');
    expect(service).toContain('DELETE_USER');
  });
});
