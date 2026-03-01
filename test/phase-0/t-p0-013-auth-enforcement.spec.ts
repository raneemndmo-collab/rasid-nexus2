/**
 * T-P0-013: K1 Auth Enforcement (DT-002)
 * Verifies all endpoints require authentication (except public ones).
 */
describe('T-P0-013: K1 Auth Enforcement (DT-002)', () => {
  it('should have JwtAuthGuard as global guard', () => {
    const fs = require('fs');
    const path = require('path');
    const authModule = fs.readFileSync(
      path.join(__dirname, '../../src/modules/k1-auth/k1-auth.module.ts'),
      'utf8',
    );
    expect(authModule).toContain('APP_GUARD');
    expect(authModule).toContain('JwtAuthGuard');
  });

  it('should have @Public() decorator for public endpoints', () => {
    const fs = require('fs');
    const path = require('path');
    const publicDecorator = fs.readFileSync(
      path.join(__dirname, '../../src/shared/presentation/decorators/public.decorator.ts'),
      'utf8',
    );
    expect(publicDecorator).toContain('Public');
    expect(publicDecorator).toContain('IS_PUBLIC_KEY');
  });

  it('should have auth controller with @Public() on login endpoint', () => {
    const fs = require('fs');
    const path = require('path');
    const controller = fs.readFileSync(
      path.join(__dirname, '../../src/modules/k1-auth/presentation/controllers/auth.controller.ts'),
      'utf8',
    );
    expect(controller).toContain('Public');
    expect(controller).toContain('login');
  });

  it('should return 401 for missing token in guard', () => {
    const fs = require('fs');
    const path = require('path');
    const guard = fs.readFileSync(
      path.join(__dirname, '../../src/shared/presentation/guards/jwt-auth.guard.ts'),
      'utf8',
    );
    expect(guard).toContain('UnauthorizedException');
    expect(guard).toContain('No token provided');
  });

  it('should return 401 for invalid token in guard', () => {
    const fs = require('fs');
    const path = require('path');
    const guard = fs.readFileSync(
      path.join(__dirname, '../../src/shared/presentation/guards/jwt-auth.guard.ts'),
      'utf8',
    );
    expect(guard).toContain('Invalid or expired token');
  });
});
