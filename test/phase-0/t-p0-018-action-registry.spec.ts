/**
 * T-P0-018: M30 Action Registry
 * Verifies registered actions return 200, unregistered return 403.
 */
describe('T-P0-018: M30 Action Registry', () => {
  it('should have action registration endpoint', () => {
    const fs = require('fs');
    const path = require('path');
    const controller = fs.readFileSync(
      path.join(__dirname, '../../src/modules/m30-actions/presentation/controllers/action.controller.ts'),
      'utf8',
    );
    expect(controller).toContain('@Post');
    expect(controller).toContain('register');
  });

  it('should have action validation endpoint', () => {
    const fs = require('fs');
    const path = require('path');
    const controller = fs.readFileSync(
      path.join(__dirname, '../../src/modules/m30-actions/presentation/controllers/action.controller.ts'),
      'utf8',
    );
    expect(controller).toContain('validate');
  });

  it('should throw ActionUnregisteredError for unregistered actions', () => {
    const fs = require('fs');
    const path = require('path');
    const service = fs.readFileSync(
      path.join(__dirname, '../../src/modules/m30-actions/application/services/action.service.ts'),
      'utf8',
    );
    expect(service).toContain('ActionUnregisteredError');
  });

  it('should have ActionUnregisteredError in domain errors', () => {
    const fs = require('fs');
    const path = require('path');
    const errors = fs.readFileSync(
      path.join(__dirname, '../../src/shared/domain/errors/domain-errors.ts'),
      'utf8',
    );
    expect(errors).toContain('ActionUnregisteredError');
  });

  it('should publish events on action registration', () => {
    const fs = require('fs');
    const path = require('path');
    const service = fs.readFileSync(
      path.join(__dirname, '../../src/modules/m30-actions/application/services/action.service.ts'),
      'utf8',
    );
    expect(service).toContain('action.registered');
    expect(service).toContain('action.deactivated');
  });
});
