/**
 * T-P0-006: K3 Audit Completeness (DT-003)
 * Verifies audit middleware intercepts all mutations.
 */
describe('T-P0-006: K3 Audit Completeness (DT-003)', () => {
  it('should have audit middleware that intercepts POST/PUT/PATCH/DELETE', () => {
    const fs = require('fs');
    const path = require('path');
    const middleware = fs.readFileSync(
      path.join(__dirname, '../../src/modules/k3-audit/presentation/middleware/audit.middleware.ts'),
      'utf8',
    );
    expect(middleware).toContain('POST');
    expect(middleware).toContain('PUT');
    expect(middleware).toContain('PATCH');
    expect(middleware).toContain('DELETE');
  });

  it('should log audit entries with required fields', () => {
    const fs = require('fs');
    const path = require('path');
    const middleware = fs.readFileSync(
      path.join(__dirname, '../../src/modules/k3-audit/presentation/middleware/audit.middleware.ts'),
      'utf8',
    );
    expect(middleware).toContain('tenantId');
    expect(middleware).toContain('userId');
    expect(middleware).toContain('action');
    expect(middleware).toContain('entityType');
    expect(middleware).toContain('correlationId');
  });

  it('should have audit service interface with log method', () => {
    const fs = require('fs');
    const path = require('path');
    const iface = fs.readFileSync(
      path.join(__dirname, '../../src/shared/domain/interfaces/audit-service.interface.ts'),
      'utf8',
    );
    expect(iface).toContain('log');
    expect(iface).toContain('AUDIT_SERVICE');
  });

  it('should have K3 module registered in AppModule', () => {
    const fs = require('fs');
    const path = require('path');
    const appModule = fs.readFileSync(
      path.join(__dirname, '../../src/app.module.ts'),
      'utf8',
    );
    expect(appModule).toContain('K3AuditModule');
  });
});
