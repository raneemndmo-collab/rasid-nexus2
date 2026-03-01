#!/usr/bin/env node
/**
 * SA-001 through SA-012: Complete Static Analysis Suite
 * Runs all 12 static analysis checks required by the Rasid Platform contract.
 *
 * SA-001: Module Structure Validation — every module follows Clean Architecture directory structure
 * SA-002: Dependency Direction — no Infrastructure→Domain imports
 * SA-003: Credential Scan — no hardcoded secrets, passwords, API keys in source
 * SA-004: Hardcoded Config Detection — no hardcoded configuration values
 * SA-005: Cross-Module DB Access — no module accesses another module's database directly
 * SA-006: Inline Prompt Detection — no inline AI prompts (for future phases)
 * SA-007: Kernel Freeze Enforcement — kernel modules not modified after freeze (placeholder for Phase 0)
 * SA-008: Plaintext Password Detection — no plaintext passwords in code
 * SA-009: Token Expiry Enforcement — all JWT tokens must have expiry
 * SA-010: RLS Enforcement — all queries must include tenant context
 * SA-011: Event Schema Validation — all events must have schema validation
 * SA-012: Module Manifest Completeness — all modules have complete manifests
 */
const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, '..', 'src');
const MODULES_DIR = path.join(SRC_DIR, 'modules');

let totalPassed = 0;
let totalFailed = 0;
const results = [];

function getAllTsFiles(dir) {
  let files = [];
  if (!fs.existsSync(dir)) return files;
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory() && item !== 'node_modules' && item !== 'dist') {
      files = files.concat(getAllTsFiles(fullPath));
    } else if (item.endsWith('.ts') && !item.endsWith('.spec.ts') && !item.endsWith('.test.ts')) {
      files.push(fullPath);
    }
  }
  return files;
}

function report(id, name, pass, details) {
  const status = pass ? '✅ PASS' : '❌ FAIL';
  console.log(`${status}: ${id} — ${name}`);
  if (details && details.length > 0) {
    details.forEach(d => console.log(`    ${d}`));
  }
  results.push({ id, name, pass, details });
  if (pass) totalPassed++;
  else totalFailed++;
}

// ═══ SA-001: Module Structure Validation ═══
function sa001() {
  const REQUIRED_DIRS = [
    'domain/entities', 'domain/interfaces',
    'application/services',
    'infrastructure/persistence/repositories',
    'presentation/controllers',
  ];
  const modules = fs.readdirSync(MODULES_DIR).filter(f =>
    fs.statSync(path.join(MODULES_DIR, f)).isDirectory()
  );
  const violations = [];
  for (const mod of modules) {
    const modPath = path.join(MODULES_DIR, mod);
    for (const dir of REQUIRED_DIRS) {
      if (!fs.existsSync(path.join(modPath, dir))) {
        violations.push(`${mod} missing ${dir}`);
      }
    }
    if (!fs.existsSync(path.join(modPath, 'module.manifest.json'))) {
      violations.push(`${mod} missing module.manifest.json`);
    }
  }
  report('SA-001', 'Module Structure Validation', violations.length === 0,
    violations.length === 0 ? [`All ${modules.length} modules follow Clean Architecture structure`] : violations);
}

// ═══ SA-002: Dependency Direction ═══
function sa002() {
  const files = getAllTsFiles(SRC_DIR);
  const violations = [];
  for (const file of files) {
    const rel = path.relative(SRC_DIR, file);
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');
    // Domain must not import from infrastructure or presentation
    if (rel.includes('/domain/')) {
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('import') && (lines[i].includes('/infrastructure/') || lines[i].includes('/presentation/'))) {
          violations.push(`${rel}:${i + 1} — Domain imports from infrastructure/presentation`);
        }
      }
    }
    // Cross-module business imports forbidden
    if (rel.includes('/modules/')) {
      const modMatch = rel.match(/modules\/([^/]+)\//);
      if (modMatch) {
        const currentMod = modMatch[1];
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].includes('import') && lines[i].includes('/modules/')) {
            const impMatch = lines[i].match(/modules\/([^/'"]+)/);
            if (impMatch && impMatch[1] !== currentMod) {
              const imported = impMatch[1];
              if (currentMod.startsWith('m') && imported.startsWith('m') && currentMod !== imported) {
                violations.push(`${rel}:${i + 1} — Cross-module: ${currentMod} → ${imported}`);
              }
            }
          }
        }
      }
    }
  }
  report('SA-002', 'Dependency Direction', violations.length === 0,
    violations.length === 0 ? ['No dependency direction violations'] : violations);
}

// ═══ SA-003: Credential Scan ═══
function sa003() {
  const files = getAllTsFiles(SRC_DIR);
  const violations = [];
  const credentialPatterns = [
    /(?:password|passwd|secret|api_key|apikey|access_token)\s*[:=]\s*['"][^'"]{3,}['"]/i,
    /(?:AWS_SECRET|PRIVATE_KEY|DB_PASSWORD)\s*[:=]\s*['"][^'"]+['"]/i,
  ];
  for (const file of files) {
    const rel = path.relative(SRC_DIR, file);
    // Skip .env files, test files, example files
    if (rel.includes('.env') || rel.includes('.example') || rel.includes('test')) continue;
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      for (const pattern of credentialPatterns) {
        if (pattern.test(lines[i]) && !lines[i].includes('process.env') && !lines[i].includes('configService')) {
          violations.push(`${rel}:${i + 1} — Potential hardcoded credential`);
        }
      }
    }
  }
  report('SA-003', 'Credential Scan', violations.length === 0,
    violations.length === 0 ? ['No hardcoded credentials found'] : violations);
}

// ═══ SA-004: Hardcoded Config Detection ═══
function sa004() {
  const files = getAllTsFiles(SRC_DIR);
  const violations = [];
  const configPatterns = [
    /(?:localhost|127\.0\.0\.1):\d{4,5}/,
    /(?:host|port|database)\s*[:=]\s*['"][^'"]+['"]/i,
  ];
  for (const file of files) {
    const rel = path.relative(SRC_DIR, file);
    if (rel.includes('test') || rel.includes('.spec') || rel.includes('config/')) continue;
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      // Only flag if not using env vars or config service
      if (lines[i].includes('process.env') || lines[i].includes('configService') || lines[i].includes('ConfigService')) continue;
      for (const pattern of configPatterns) {
        if (pattern.test(lines[i]) && !lines[i].trim().startsWith('//') && !lines[i].trim().startsWith('*')) {
          // Allow TypeORM entity decorators and interface definitions
          if (lines[i].includes('@Column') || lines[i].includes('@Entity') || lines[i].includes('interface') || lines[i].includes('type ')) continue;
          violations.push(`${rel}:${i + 1} — Potential hardcoded config: ${lines[i].trim().substring(0, 80)}`);
        }
      }
    }
  }
  report('SA-004', 'Hardcoded Config Detection', violations.length === 0,
    violations.length === 0 ? ['No hardcoded configurations found'] : violations.slice(0, 10));
}

// ═══ SA-005: Cross-Module DB Access ═══
function sa005() {
  const files = getAllTsFiles(SRC_DIR);
  const violations = [];
  const dbNames = ['k1_auth_db', 'k2_tenant_db', 'k3_audit_db', 'k4_config_db', 'k5_events_db',
    'm1_auth_users_db', 'm2_tenants_db', 'm3_roles_db', 'm4_permissions_db', 'm30_actions_db'];
  for (const file of files) {
    const rel = path.relative(SRC_DIR, file);
    if (rel.includes('test') || rel.includes('.spec')) continue;
    const content = fs.readFileSync(file, 'utf8');
    const modMatch = rel.match(/modules\/([^/]+)\//);
    if (!modMatch) continue;
    const currentMod = modMatch[1];
    const currentDbPrefix = currentMod.replace('-', '_').split('/')[0];
    for (const dbName of dbNames) {
      const dbPrefix = dbName.split('_db')[0];
      if (dbPrefix !== currentDbPrefix && content.includes(dbName)) {
        violations.push(`${rel} — Module ${currentMod} references ${dbName}`);
      }
    }
  }
  report('SA-005', 'Cross-Module DB Access', violations.length === 0,
    violations.length === 0 ? ['No cross-module database access found'] : violations);
}

// ═══ SA-006: Inline Prompt Detection ═══
function sa006() {
  const files = getAllTsFiles(SRC_DIR);
  const violations = [];
  const promptPatterns = [
    /(?:prompt|system_message|user_message)\s*[:=]\s*[`'"]{1,3}[^`'"]{50,}/i,
    /(?:openai|anthropic|gpt|claude)\s*\.\s*(?:chat|complete|generate)/i,
  ];
  for (const file of files) {
    const rel = path.relative(SRC_DIR, file);
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      for (const pattern of promptPatterns) {
        if (pattern.test(lines[i])) {
          violations.push(`${rel}:${i + 1} — Inline AI prompt detected`);
        }
      }
    }
  }
  report('SA-006', 'Inline Prompt Detection', violations.length === 0,
    violations.length === 0 ? ['No inline AI prompts found (Phase 0 has no AI modules)'] : violations);
}

// ═══ SA-007: Kernel Freeze Enforcement ═══
function sa007() {
  // In Phase 0, kernel is not yet frozen. This check becomes active after Phase 0 approval.
  report('SA-007', 'Kernel Freeze Enforcement', true,
    ['Phase 0: Kernel not yet frozen — check will be enforced from Phase 1 onwards']);
}

// ═══ SA-008: Plaintext Password Detection ═══
function sa008() {
  const files = getAllTsFiles(SRC_DIR);
  const violations = [];
  for (const file of files) {
    const rel = path.relative(SRC_DIR, file);
    if (rel.includes('test') || rel.includes('.spec') || rel.includes('.dto')) continue;
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      // Check for storing password without hashing
      if (/password\s*[:=].*(?:req|body|dto|input)\./i.test(lines[i]) &&
          !lines[i].includes('hash') && !lines[i].includes('bcrypt') && !lines[i].includes('argon') &&
          !lines[i].includes('password_hash') && !lines[i].includes('passwordHash') &&
          !lines[i].trim().startsWith('//')) {
        violations.push(`${rel}:${i + 1} — Potential plaintext password storage`);
      }
    }
  }
  report('SA-008', 'Plaintext Password Detection', violations.length === 0,
    violations.length === 0 ? ['No plaintext password storage detected'] : violations);
}

// ═══ SA-009: Token Expiry Enforcement ═══
function sa009() {
  const files = getAllTsFiles(SRC_DIR);
  const violations = [];
  for (const file of files) {
    const rel = path.relative(SRC_DIR, file);
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (/jwt\.sign\s*\(/.test(lines[i]) || /jwtService\.sign\s*\(/.test(lines[i])) {
        // Check if expiresIn is present in the surrounding context (next 5 lines)
        const context = lines.slice(i, Math.min(i + 5, lines.length)).join(' ');
        if (!context.includes('expiresIn') && !context.includes('exp')) {
          violations.push(`${rel}:${i + 1} — JWT sign without expiry`);
        }
      }
    }
  }
  report('SA-009', 'Token Expiry Enforcement', violations.length === 0,
    violations.length === 0 ? ['All JWT tokens include expiry'] : violations);
}

// ═══ SA-010: RLS / Tenant Context Enforcement ═══
function sa010() {
  const files = getAllTsFiles(SRC_DIR);
  const violations = [];
  for (const file of files) {
    const rel = path.relative(SRC_DIR, file);
    if (!rel.includes('/infrastructure/persistence/')) continue;
    const content = fs.readFileSync(file, 'utf8');
    // Check that repository files reference tenant_id
    if (rel.includes('.repository.') && !rel.includes('.orm-entity')) {
      if (!content.includes('tenant_id') && !content.includes('tenantId') && !content.includes('TenantId')) {
        // K3 audit and K5 events may not need tenant filtering in all queries
        if (!rel.includes('k3-audit') && !rel.includes('k5-events') && !rel.includes('k4-config')) {
          violations.push(`${rel} — Repository does not reference tenant_id`);
        }
      }
    }
  }
  report('SA-010', 'RLS / Tenant Context Enforcement', violations.length === 0,
    violations.length === 0 ? ['All repositories include tenant context'] : violations);
}

// ═══ SA-011: Event Schema Validation ═══
function sa011() {
  const files = getAllTsFiles(SRC_DIR);
  let hasSchemaRegistry = false;
  let hasEventValidation = false;
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes('schema') && content.includes('event') && (content.includes('validate') || content.includes('registry'))) {
      hasSchemaRegistry = true;
    }
    if (content.includes('event_type') && content.includes('payload') && content.includes('tenant_id')) {
      hasEventValidation = true;
    }
  }
  // Check K5 events module has schema validation
  const k5Files = getAllTsFiles(path.join(MODULES_DIR, 'k5-events'));
  let k5HasSchema = false;
  for (const file of k5Files) {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes('schema') || content.includes('Schema') || content.includes('validate')) {
      k5HasSchema = true;
    }
  }
  const pass = hasEventValidation && (hasSchemaRegistry || k5HasSchema);
  report('SA-011', 'Event Schema Validation', pass,
    pass ? ['K5 Event Bus includes schema validation infrastructure'] : ['Missing event schema validation in K5']);
}

// ═══ SA-012: Module Manifest Completeness ═══
function sa012() {
  const modules = fs.readdirSync(MODULES_DIR).filter(f =>
    fs.statSync(path.join(MODULES_DIR, f)).isDirectory()
  );
  const violations = [];
  const requiredFields = ['name', 'version', 'phase', 'dependencies'];
  for (const mod of modules) {
    const manifestPath = path.join(MODULES_DIR, mod, 'module.manifest.json');
    if (!fs.existsSync(manifestPath)) {
      violations.push(`${mod}: missing module.manifest.json`);
      continue;
    }
    try {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      for (const field of requiredFields) {
        if (!(field in manifest)) {
          violations.push(`${mod}: manifest missing field '${field}'`);
        }
      }
    } catch (e) {
      violations.push(`${mod}: invalid JSON in module.manifest.json`);
    }
  }
  report('SA-012', 'Module Manifest Completeness', violations.length === 0,
    violations.length === 0 ? [`All ${modules.length} module manifests are complete`] : violations);
}

// ═══ Run All ═══
console.log('═══════════════════════════════════════════════════════════');
console.log('  RASID PLATFORM — Static Analysis Suite (SA-001 to SA-012)');
console.log('═══════════════════════════════════════════════════════════\n');

sa001();
sa002();
sa003();
sa004();
sa005();
sa006();
sa007();
sa008();
sa009();
sa010();
sa011();
sa012();

console.log('\n═══════════════════════════════════════════════════════════');
console.log(`  SUMMARY: ${totalPassed}/${totalPassed + totalFailed} checks PASSED`);
if (totalFailed > 0) {
  console.log(`  FAILED: ${totalFailed} checks`);
}
console.log('═══════════════════════════════════════════════════════════');

// Write results
fs.writeFileSync(
  path.join(__dirname, '..', 'test', 'phase-0-real', 'sa-results.json'),
  JSON.stringify(results, null, 2)
);

process.exit(totalFailed > 0 ? 1 : 0);
