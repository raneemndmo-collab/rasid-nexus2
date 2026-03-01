/**
 * T-P0-023: Dependency Direction
 * Verifies no reverse imports (Infrastructure → Domain = forbidden).
 */
import { execSync } from 'child_process';
import * as path from 'path';

describe('T-P0-023: Dependency Direction', () => {
  it('should pass dependency direction check', () => {
    const rootDir = path.join(__dirname, '../..');
    const result = execSync(`node ${path.join(rootDir, 'scripts/sa-dependency-direction.js')}`, { encoding: 'utf8' });
    expect(result).toContain('PASS');
  });

  it('should not have domain files importing from infrastructure', () => {
    const fs = require('fs');
    const rootDir = path.join(__dirname, '../../src/modules');
    const modules = fs.readdirSync(rootDir).filter((f: string) =>
      fs.statSync(path.join(rootDir, f)).isDirectory()
    );

    for (const mod of modules) {
      const domainDir = path.join(rootDir, mod, 'domain');
      if (fs.existsSync(domainDir)) {
        const files = getAllTsFiles(domainDir);
        for (const file of files) {
          const content = fs.readFileSync(file, 'utf8');
          expect(content).not.toContain("from '../infrastructure");
          expect(content).not.toContain("from '../../infrastructure");
          expect(content).not.toContain("from '../presentation");
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
});
