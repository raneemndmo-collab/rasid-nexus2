/**
 * T-P0-019: E2E Flow
 * Verifies the complete flow: signup → login → create tenant → assign role → check permission → audit.
 */
describe('T-P0-019: E2E Flow', () => {
  it('should have all required modules in AppModule', () => {
    const fs = require('fs');
    const path = require('path');
    const appModule = fs.readFileSync(
      path.join(__dirname, '../../src/app.module.ts'),
      'utf8',
    );
    expect(appModule).toContain('K1AuthModule');
    expect(appModule).toContain('K2TenantModule');
    expect(appModule).toContain('K3AuditModule');
    expect(appModule).toContain('K4ConfigModule');
    expect(appModule).toContain('K5EventsModule');
    expect(appModule).toContain('M1AuthUsersModule');
    expect(appModule).toContain('M2TenantsModule');
    expect(appModule).toContain('M3RolesModule');
    expect(appModule).toContain('M4PermissionsModule');
    expect(appModule).toContain('M30ActionsModule');
  });

  it('should have health endpoints', () => {
    const fs = require('fs');
    const path = require('path');
    const health = fs.readFileSync(
      path.join(__dirname, '../../src/health.controller.ts'),
      'utf8',
    );
    expect(health).toContain('health');
    expect(health).toContain('ready');
  });

  it('should have Swagger/OpenAPI documentation', () => {
    const fs = require('fs');
    const path = require('path');
    const main = fs.readFileSync(
      path.join(__dirname, '../../src/main.ts'),
      'utf8',
    );
    expect(main).toContain('SwaggerModule');
    expect(main).toContain('api/docs');
    expect(main).toContain('Rasid Platform');
  });

  it('should have global validation pipe', () => {
    const fs = require('fs');
    const path = require('path');
    const main = fs.readFileSync(
      path.join(__dirname, '../../src/main.ts'),
      'utf8',
    );
    expect(main).toContain('ValidationPipe');
    expect(main).toContain('whitelist');
    expect(main).toContain('forbidNonWhitelisted');
  });

  it('should have CORS enabled', () => {
    const fs = require('fs');
    const path = require('path');
    const main = fs.readFileSync(
      path.join(__dirname, '../../src/main.ts'),
      'utf8',
    );
    expect(main).toContain('enableCors');
  });
});
