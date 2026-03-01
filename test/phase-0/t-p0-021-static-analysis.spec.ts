/**
 * T-P0-021: Static Analysis (SA-001–SA-012)
 * Runs static analysis checks on all Phase 0 code.
 */
const { execSync } = require('child_process');
const path = require('path');

describe('T-P0-021: Static Analysis (SA-001–SA-012)', () => {
  const rootDir = path.join(__dirname, '../..');

  it('SA-001: Module Structure Validation', () => {
    const result = execSync(`node ${path.join(rootDir, 'scripts/sa-module-structure.js')}`, { encoding: 'utf8' });
    expect(result).toContain('PASS');
  });

  it('SA-002: Dependency Direction Check', () => {
    const result = execSync(`node ${path.join(rootDir, 'scripts/sa-dependency-direction.js')}`, { encoding: 'utf8' });
    expect(result).toContain('PASS');
  });

  it('SA-003: TypeScript strict mode enabled', () => {
    const fs = require('fs');
    const tsconfig = JSON.parse(fs.readFileSync(path.join(rootDir, 'tsconfig.json'), 'utf8'));
    expect(tsconfig.compilerOptions.strict).toBe(true);
  });

  it('SA-004: No hardcoded secrets in source', () => {
    const fs = require('fs');
    const srcDir = path.join(rootDir, 'src');
    function checkDir(dir: string): string[] {
      const violations: string[] = [];
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const fullPath = path.join(dir, item);
        if (fs.statSync(fullPath).isDirectory()) {
          violations.push(...checkDir(fullPath));
        } else if (item.endsWith('.ts')) {
          const content = fs.readFileSync(fullPath, 'utf8');
          if (content.match(/password\s*=\s*['"][^'"]+['"]/i) && !content.includes('.spec.ts')) {
            violations.push(fullPath);
          }
        }
      }
      return violations;
    }
    const violations = checkDir(srcDir);
    expect(violations).toEqual([]);
  });

  it('SA-005: All modules have module.manifest.json', () => {
    const fs = require('fs');
    const modulesDir = path.join(rootDir, 'src/modules');
    const modules = fs.readdirSync(modulesDir).filter((f: string) =>
      fs.statSync(path.join(modulesDir, f)).isDirectory()
    );
    for (const mod of modules) {
      expect(fs.existsSync(path.join(modulesDir, mod, 'module.manifest.json'))).toBe(true);
    }
  });

  it('SA-006: No direct cross-module database access', () => {
    const fs = require('fs');
    const srcDir = path.join(rootDir, 'src/modules');
    const modules = fs.readdirSync(srcDir).filter((f: string) =>
      fs.statSync(path.join(srcDir, f)).isDirectory()
    );
    for (const mod of modules) {
      const modDir = path.join(srcDir, mod);
      const files = getAllTsFiles(modDir);
      for (const file of files) {
        const content = fs.readFileSync(file, 'utf8');
        // Check for direct DB imports from other modules
        for (const otherMod of modules) {
          if (otherMod !== mod && otherMod.startsWith('m')) {
            const hasDirectImport = content.includes(`from '../../${otherMod}/infrastructure/persistence`);
            expect(hasDirectImport).toBe(false);
          }
        }
      }
    }

    function getAllTsFiles(dir: string): string[] {
      let results: string[] = [];
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const fullPath = path.join(dir, item);
        if (fs.statSync(fullPath).isDirectory()) {
          results = results.concat(getAllTsFiles(fullPath));
        } else if (item.endsWith('.ts')) {
          results.push(fullPath);
        }
      }
      return results;
    }
  });

  it('SA-007: All services use dependency injection', () => {
    const fs = require('fs');
    const srcDir = path.join(rootDir, 'src/modules');
    const modules = fs.readdirSync(srcDir).filter((f: string) =>
      fs.statSync(path.join(srcDir, f)).isDirectory()
    );
    for (const mod of modules) {
      const serviceDir = path.join(srcDir, mod, 'application/services');
      if (fs.existsSync(serviceDir)) {
        const files = fs.readdirSync(serviceDir).filter((f: string) => f.endsWith('.ts'));
        for (const file of files) {
          const content = fs.readFileSync(path.join(serviceDir, file), 'utf8');
          expect(content).toContain('@Injectable');
        }
      }
    }
  });

  it('SA-008: No plaintext passwords in codebase', () => {
    const fs = require('fs');
    const srcDir = path.join(rootDir, 'src');
    function checkForPlaintext(dir: string): string[] {
      const violations: string[] = [];
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const fullPath = path.join(dir, item);
        if (fs.statSync(fullPath).isDirectory()) {
          violations.push(...checkForPlaintext(fullPath));
        } else if (item.endsWith('.ts') && !item.includes('.spec.')) {
          const content = fs.readFileSync(fullPath, 'utf8');
          if (content.includes('plaintext') || content.includes('plain_text')) {
            violations.push(fullPath);
          }
        }
      }
      return violations;
    }
    const violations = checkForPlaintext(srcDir);
    expect(violations).toEqual([]);
  });

  it('SA-009: All ORM entities use UUID primary keys', () => {
    const fs = require('fs');
    const srcDir = path.join(rootDir, 'src/modules');
    const modules = fs.readdirSync(srcDir).filter((f: string) =>
      fs.statSync(path.join(srcDir, f)).isDirectory()
    );
    for (const mod of modules) {
      const repoDir = path.join(srcDir, mod, 'infrastructure/persistence/repositories');
      if (fs.existsSync(repoDir)) {
        const files = fs.readdirSync(repoDir).filter((f: string) => f.endsWith('.orm-entity.ts'));
        for (const file of files) {
          const content = fs.readFileSync(path.join(repoDir, file), 'utf8');
          if (content.includes('PrimaryGeneratedColumn')) {
            expect(content).toContain("'uuid'");
          }
        }
      }
    }
  });

  it('SA-010: All controllers have API tags', () => {
    const fs = require('fs');
    const srcDir = path.join(rootDir, 'src/modules');
    const modules = fs.readdirSync(srcDir).filter((f: string) =>
      fs.statSync(path.join(srcDir, f)).isDirectory()
    );
    for (const mod of modules) {
      const ctrlDir = path.join(srcDir, mod, 'presentation/controllers');
      if (fs.existsSync(ctrlDir)) {
        const files = fs.readdirSync(ctrlDir).filter((f: string) => f.endsWith('.ts'));
        for (const file of files) {
          const content = fs.readFileSync(path.join(ctrlDir, file), 'utf8');
          expect(content).toContain('@ApiTags');
        }
      }
    }
  });
});
