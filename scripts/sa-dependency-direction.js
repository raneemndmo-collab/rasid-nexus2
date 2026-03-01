#!/usr/bin/env node
/**
 * SA-002: Dependency Direction Check
 * Ensures no infrastructure → domain imports (only domain ← infrastructure allowed).
 */
const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, '..', 'src');

function getAllTsFiles(dir) {
  let results = [];
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory() && item !== 'node_modules') {
      results = results.concat(getAllTsFiles(fullPath));
    } else if (item.endsWith('.ts')) {
      results.push(fullPath);
    }
  }
  return results;
}

const VIOLATIONS = [];

// Rule: Domain files must NOT import from infrastructure or presentation
const files = getAllTsFiles(SRC_DIR);
for (const file of files) {
  const relativePath = path.relative(SRC_DIR, file);
  const content = fs.readFileSync(file, 'utf8');

  if (relativePath.includes('/domain/')) {
    // Domain should not import from infrastructure or presentation
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.includes('import') && (line.includes('/infrastructure/') || line.includes('/presentation/'))) {
        VIOLATIONS.push(`${relativePath}:${i + 1} — Domain imports from infrastructure/presentation`);
      }
    }
  }

  // Rule: No cross-module direct imports (M1 should not import from M2, etc.)
  if (relativePath.includes('/modules/')) {
    const moduleMatch = relativePath.match(/modules\/([^/]+)\//);
    if (moduleMatch) {
      const currentModule = moduleMatch[1];
      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.includes('import') && line.includes('/modules/')) {
          const importMatch = line.match(/modules\/([^/'"]+)/);
          if (importMatch && importMatch[1] !== currentModule) {
            // Allow kernel imports from business modules
            const importedModule = importMatch[1];
            const isKernelImport = importedModule.startsWith('k');
            const isBusinessModule = currentModule.startsWith('m');
            if (!(isBusinessModule && isKernelImport)) {
              // Check if it's a cross-business-module import
              if (currentModule.startsWith('m') && importedModule.startsWith('m') && currentModule !== importedModule) {
                VIOLATIONS.push(`${relativePath}:${i + 1} — Cross-module import: ${currentModule} → ${importedModule}`);
              }
            }
          }
        }
      }
    }
  }
}

if (VIOLATIONS.length === 0) {
  console.log('PASS: No dependency direction violations found');
  process.exit(0);
} else {
  console.error('FAIL: Dependency direction violations:');
  VIOLATIONS.forEach(v => console.error(`  ${v}`));
  process.exit(1);
}
