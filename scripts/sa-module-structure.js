#!/usr/bin/env node
/**
 * SA-001: Module Structure Validation
 * Verifies every module follows the Clean Architecture directory structure.
 */
const fs = require('fs');
const path = require('path');

const MODULES_DIR = path.join(__dirname, '..', 'src', 'modules');
const REQUIRED_DIRS = [
  'domain/entities',
  'domain/interfaces',
  'application/services',
  'infrastructure/persistence/repositories',
  'presentation/controllers',
];

const modules = fs.readdirSync(MODULES_DIR).filter(f =>
  fs.statSync(path.join(MODULES_DIR, f)).isDirectory()
);

let allPassed = true;

for (const mod of modules) {
  const modPath = path.join(MODULES_DIR, mod);
  for (const dir of REQUIRED_DIRS) {
    const fullPath = path.join(modPath, dir);
    if (!fs.existsSync(fullPath)) {
      console.error(`FAIL: ${mod} missing ${dir}`);
      allPassed = false;
    }
  }
  // Check module manifest
  const manifest = path.join(modPath, 'module.manifest.json');
  if (!fs.existsSync(manifest)) {
    console.error(`FAIL: ${mod} missing module.manifest.json`);
    allPassed = false;
  }
}

if (allPassed) {
  console.log(`PASS: All ${modules.length} modules follow Clean Architecture structure`);
  process.exit(0);
} else {
  process.exit(1);
}
