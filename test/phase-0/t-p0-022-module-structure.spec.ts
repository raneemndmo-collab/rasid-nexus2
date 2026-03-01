/**
 * T-P0-022: Module Structure Validation
 * Verifies every module follows the structure defined in Section 0.2.
 */
describe('T-P0-022: Module Structure Validation', () => {
  const fs = require('fs');
  const path = require('path');
  const MODULES_DIR = path.join(__dirname, '../../src/modules');

  const REQUIRED_STRUCTURE = {
    'domain/entities': 'Domain entities',
    'domain/interfaces': 'Domain interfaces (ports)',
    'application/services': 'Application services',
    'infrastructure/persistence/repositories': 'Infrastructure repositories',
    'presentation/controllers': 'Presentation controllers',
  };

  const modules = fs.readdirSync(MODULES_DIR).filter((f: string) =>
    fs.statSync(path.join(MODULES_DIR, f)).isDirectory()
  );

  for (const mod of modules) {
    describe(`Module: ${mod}`, () => {
      for (const [dir, desc] of Object.entries(REQUIRED_STRUCTURE)) {
        it(`should have ${desc} (${dir})`, () => {
          const fullPath = path.join(MODULES_DIR, mod, dir);
          expect(fs.existsSync(fullPath)).toBe(true);
        });
      }

      it('should have module.manifest.json', () => {
        const manifestPath = path.join(MODULES_DIR, mod, 'module.manifest.json');
        expect(fs.existsSync(manifestPath)).toBe(true);
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        expect(manifest).toHaveProperty('moduleId');
        expect(manifest).toHaveProperty('name');
        expect(manifest).toHaveProperty('database');
      });

      it('should have NestJS module file', () => {
        const moduleFile = path.join(MODULES_DIR, mod, `${mod}.module.ts`);
        expect(fs.existsSync(moduleFile)).toBe(true);
      });
    });
  }

  it('should have at least 10 modules (Phase 0 baseline)', () => {
    expect(modules.length).toBeGreaterThanOrEqual(10);
  });
});
