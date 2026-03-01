/**
 * T-P0-003: RLS Enforcement
 * Verifies Row-Level Security is configured for all tenant-scoped tables.
 */
describe('T-P0-003: RLS Enforcement', () => {
  it('should have RLS SQL script for all databases', () => {
    const fs = require('fs');
    const path = require('path');
    const rlsScript = fs.readFileSync(
      path.join(__dirname, '../../infrastructure/database/init/02-enable-rls.sql'),
      'utf8',
    );
    expect(rlsScript).toContain('ENABLE ROW LEVEL SECURITY');
    expect(rlsScript).toContain('FORCE ROW LEVEL SECURITY');
    expect(rlsScript).toContain('app.current_tenant_id');
  });

  it('should have RLS policies for tenant isolation', () => {
    const fs = require('fs');
    const path = require('path');
    const rlsScript = fs.readFileSync(
      path.join(__dirname, '../../infrastructure/database/init/02-enable-rls.sql'),
      'utf8',
    );
    expect(rlsScript).toContain('CREATE POLICY');
    expect(rlsScript).toContain('tenant_isolation');
  });

  it('should have tenant_id column in all tenant-scoped ORM entities', () => {
    const fs = require('fs');
    const path = require('path');
    const modulesDir = path.join(__dirname, '../../src/modules');
    const tenantScopedModules = ['m1-auth-users', 'm3-roles', 'm4-permissions', 'k1-auth', 'k3-audit', 'k4-config'];

    for (const mod of tenantScopedModules) {
      const repoDir = path.join(modulesDir, mod, 'infrastructure/persistence/repositories');
      if (fs.existsSync(repoDir)) {
        const files = fs.readdirSync(repoDir).filter((f: string) => f.endsWith('.orm-entity.ts'));
        for (const file of files) {
          const content = fs.readFileSync(path.join(repoDir, file), 'utf8');
          expect(content).toContain('tenant_id');
        }
      }
    }
  });

  it('should enforce RLS via K2 TenantContext middleware', () => {
    const fs = require('fs');
    const path = require('path');
    const middleware = fs.readFileSync(
      path.join(__dirname, '../../src/modules/k2-tenant/presentation/middleware/tenant-context.middleware.ts'),
      'utf8',
    );
    expect(middleware).toContain('tenantId');
    expect(middleware).toContain('ForbiddenException');
  });
});
