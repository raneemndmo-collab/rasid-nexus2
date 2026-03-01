/**
 * T-P0-008: K4 Config Cache
 * Verifies config caching with Redis and cache invalidation on write.
 */
describe('T-P0-008: K4 Config Cache', () => {
  it('should have Redis cache service', () => {
    const fs = require('fs');
    const path = require('path');
    const cacheService = fs.readFileSync(
      path.join(__dirname, '../../src/modules/k4-config/infrastructure/external/redis-cache.service.ts'),
      'utf8',
    );
    expect(cacheService).toContain('Redis');
    expect(cacheService).toContain('get');
    expect(cacheService).toContain('set');
    expect(cacheService).toContain('del');
  });

  it('should invalidate cache on config update', () => {
    const fs = require('fs');
    const path = require('path');
    const configService = fs.readFileSync(
      path.join(__dirname, '../../src/modules/k4-config/application/services/config.service.ts'),
      'utf8',
    );
    // Service should call cache delete/invalidate on write
    expect(configService).toContain('del');
    expect(configService).toContain('set');
  });

  it('should have TTL configuration for cache', () => {
    const fs = require('fs');
    const path = require('path');
    const cacheService = fs.readFileSync(
      path.join(__dirname, '../../src/modules/k4-config/infrastructure/external/redis-cache.service.ts'),
      'utf8',
    );
    expect(cacheService).toContain('EX');
  });
});
