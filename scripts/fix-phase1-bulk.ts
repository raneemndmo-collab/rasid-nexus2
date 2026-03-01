import * as fs from 'fs';
import * as path from 'path';

const replacements: [RegExp, string][] = [
  // snake_case property names -> camelCase
  [/\btenant_id\b/g, 'tenantId'],
  [/\bcreated_at\b/g, 'createdAt'],
  [/\bupdated_at\b/g, 'updatedAt'],
  [/\bdepartment_id\b/g, 'departmentId'],
  [/\bparent_id\b/g, 'parentId'],
  [/\bemployee_id\b/g, 'employeeId'],
  [/\bleave_type\b/g, 'leaveType'],
  [/\bstart_date\b/g, 'startDate'],
  [/\bend_date\b/g, 'endDate'],
  [/\bcheck_in\b/g, 'checkIn'],
  [/\bcheck_out\b/g, 'checkOut'],
  [/\bwork_hours\b/g, 'workHours'],
  [/\bis_active\b/g, 'isActive'],
  [/\bhire_date\b/g, 'hireDate'],
  [/\bjob_title\b/g, 'jobTitle'],
  [/\bphone_number\b/g, 'phoneNumber'],
  [/\bnational_id\b/g, 'nationalId'],
  [/\bmax_depth\b/g, 'maxDepth'],
  [/\btotal_days\b/g, 'totalDays'],
  [/\bused_days\b/g, 'usedDays'],
  [/\bremaining_days\b/g, 'remainingDays'],
  [/\bapproved_by\b/g, 'approvedBy'],
  [/\brejected_by\b/g, 'rejectedBy'],
  [/\bmanager_id\b/g, 'managerId'],
  [/\bleave_balance\b/g, 'leaveBalance'],
  [/\bleave_balances\b/g, 'leaveBalances'],
  [/\bbalance_year\b/g, 'balanceYear'],
  [/\bip_address\b/g, 'ipAddress'],
  [/\bdevice_info\b/g, 'deviceInfo'],
  [/\bovertime_hours\b/g, 'overtimeHours'],
  [/\bovertime_minutes\b/g, 'overtimeMinutes'],
  [/\blate_minutes\b/g, 'lateMinutes'],
  [/\bearly_leave_minutes\b/g, 'earlyLeaveMinutes'],
];

// Patterns that should NOT be replaced (column names in decorators)
const columnNamePattern = /name:\s*'/;

function fixFile(filePath: string): void {
  let content = fs.readFileSync(filePath, 'utf-8');
  const original = content;
  
  // Split into lines, process each
  const lines = content.split('\n');
  const fixedLines = lines.map(line => {
    // Don't replace inside @Column({ name: '...' }) or string literals with single quotes
    if (line.includes("name: '") || line.includes("name: \"")) {
      // Only replace the property declaration part, not the column name
      // e.g., @Column({ name: 'tenant_id' }) should stay, but tenantId!: string should be fixed
      // The name mapping is already correct from the ORM entity rewrites
      return line;
    }
    
    let fixed = line;
    for (const [pattern, replacement] of replacements) {
      fixed = fixed.replace(pattern, replacement);
    }
    return fixed;
  });
  
  content = fixedLines.join('\n');
  
  // Fix ORM entity property declarations: add ! assertion
  // Pattern: "  propertyName: Type" (indented, no !, not optional)
  content = content.replace(/^(  \w+)(: (?:string|number|boolean|Date|Record<string, unknown>);)$/gm, '$1!$2');
  
  if (content !== original) {
    fs.writeFileSync(filePath, content);
    console.log(`Fixed: ${filePath}`);
  } else {
    console.log(`No changes: ${filePath}`);
  }
}

// Process all Phase 1 module files
const modules = ['m5-departments', 'm6-employees', 'm7-attendance', 'm8-leave'];
const baseDir = path.join(__dirname, '..', 'src', 'modules');

for (const mod of modules) {
  const modDir = path.join(baseDir, mod);
  const files = getAllTsFiles(modDir);
  for (const file of files) {
    fixFile(file);
  }
}

function getAllTsFiles(dir: string): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) return results;
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...getAllTsFiles(fullPath));
    } else if (entry.name.endsWith('.ts') && !entry.name.endsWith('.spec.ts')) {
      results.push(fullPath);
    }
  }
  return results;
}
