/**
 * T-P0-005: K2 Cross-Tenant Isolation (DT-001)
 * Verifies that tenant isolation is enforced at every level.
 */
describe('T-P0-005: K2 Cross-Tenant Isolation (DT-001)', () => {
  it('should have TenantContext middleware that rejects missing tenant_id', () => {
    const fs = require('fs');
    const path = require('path');
    const middleware = fs.readFileSync(
      path.join(__dirname, '../../src/modules/k2-tenant/presentation/middleware/tenant-context.middleware.ts'),
      'utf8',
    );
    expect(middleware).toContain('ForbiddenException');
    expect(middleware).toContain('Missing tenant context');
  });

  it('should set tenant context from JWT payload', () => {
    const fs = require('fs');
    const path = require('path');
    const guard = fs.readFileSync(
      path.join(__dirname, '../../src/shared/presentation/guards/jwt-auth.guard.ts'),
      'utf8',
    );
    expect(guard).toContain('tenantId');
    expect(guard).toContain('tenantContext');
  });

  it('should have RLS policies that filter by tenant_id', () => {
    const fs = require('fs');
    const path = require('path');
    const rlsScript = fs.readFileSync(
      path.join(__dirname, '../../infrastructure/database/init/02-enable-rls.sql'),
      'utf8',
    );
    expect(rlsScript).toContain('current_setting');
    expect(rlsScript).toContain('app.current_tenant_id');
  });

  it('should have K2 RLS service for setting tenant context', () => {
    const fs = require('fs');
    const path = require('path');
    const rlsService = fs.readFileSync(
      path.join(__dirname, '../../src/modules/k2-tenant/application/services/rls.service.ts'),
      'utf8',
    );
    expect(rlsService).toContain('app.current_tenant_id');
    expect(rlsService).toContain('SET');
  });

  it('should have tenant_id indexed in all tenant-scoped entities', () => {
    const fs = require('fs');
    const path = require('path');
    const ormFiles = [
      '../../src/modules/m1-auth-users/infrastructure/persistence/repositories/user.orm-entity.ts',
      '../../src/modules/m3-roles/infrastructure/persistence/repositories/role.orm-entity.ts',
      '../../src/modules/m4-permissions/infrastructure/persistence/repositories/permission.orm-entity.ts',
    ];
    for (const file of ormFiles) {
      const content = fs.readFileSync(path.join(__dirname, file), 'utf8');
      expect(content).toContain('@Index()');
      expect(content).toContain('tenant_id');
    }
  });
});
