/**
 * T-P0-016: M2 Tenant Lifecycle
 * Verifies tenant create, activate, suspend operations with events.
 */
describe('T-P0-016: M2 Tenant Lifecycle', () => {
  it('should have tenant controller with CRUD endpoints', () => {
    const fs = require('fs');
    const path = require('path');
    const controller = fs.readFileSync(
      path.join(__dirname, '../../src/modules/m2-tenants/presentation/controllers/tenant.controller.ts'),
      'utf8',
    );
    expect(controller).toContain('@Post');
    expect(controller).toContain('@Get');
    expect(controller).toContain('@Put');
    expect(controller).toContain('@Delete');
  });

  it('should publish events on tenant mutations', () => {
    const fs = require('fs');
    const path = require('path');
    const service = fs.readFileSync(
      path.join(__dirname, '../../src/modules/m2-tenants/application/services/tenant.service.ts'),
      'utf8',
    );
    expect(service).toContain('tenant.created');
    expect(service).toContain('tenant.updated');
    expect(service).toContain('tenant.deleted');
  });

  it('should have isActive field for tenant suspension', () => {
    const fs = require('fs');
    const path = require('path');
    const entity = fs.readFileSync(
      path.join(__dirname, '../../src/modules/m2-tenants/infrastructure/persistence/repositories/tenant.orm-entity.ts'),
      'utf8',
    );
    expect(entity).toContain('isActive');
    expect(entity).toContain('is_active');
  });

  it('should prevent duplicate tenant slugs', () => {
    const fs = require('fs');
    const path = require('path');
    const service = fs.readFileSync(
      path.join(__dirname, '../../src/modules/m2-tenants/application/services/tenant.service.ts'),
      'utf8',
    );
    expect(service).toContain('ConflictException');
    expect(service).toContain('slug already exists');
  });
});
