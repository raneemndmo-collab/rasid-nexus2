/**
 * T-P0-007: K3 Audit Immutability
 * Verifies audit log is append-only — no UPDATE or DELETE allowed.
 */
describe('T-P0-007: K3 Audit Immutability', () => {
  it('should have append-only repository (no update/delete methods)', () => {
    const fs = require('fs');
    const path = require('path');
    const repo = fs.readFileSync(
      path.join(__dirname, '../../src/modules/k3-audit/infrastructure/persistence/repositories/audit.repository.ts'),
      'utf8',
    );
    // Repository should have 'create' but not 'update' or 'delete'
    expect(repo).toContain('save');
    expect(repo).not.toContain('async update');
    expect(repo).not.toContain('async delete');
  });

  it('should have audit ORM entity without update timestamp', () => {
    const fs = require('fs');
    const path = require('path');
    const entity = fs.readFileSync(
      path.join(__dirname, '../../src/modules/k3-audit/infrastructure/persistence/repositories/audit-log.orm-entity.ts'),
      'utf8',
    );
    expect(entity).toContain('CreateDateColumn');
    // Audit logs should NOT have UpdateDateColumn
    expect(entity).not.toContain('UpdateDateColumn');
  });

  it('should have K3 controller with only GET endpoints (no POST/PUT/DELETE for audit data)', () => {
    const fs = require('fs');
    const path = require('path');
    const controller = fs.readFileSync(
      path.join(__dirname, '../../src/modules/k3-audit/presentation/controllers/audit.controller.ts'),
      'utf8',
    );
    expect(controller).toContain('@Get');
    expect(controller).not.toContain('@Delete');
    expect(controller).not.toContain('@Put');
  });
});
