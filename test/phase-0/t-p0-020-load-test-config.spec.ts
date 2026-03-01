/**
 * T-P0-020: Load Test Configuration
 * Verifies load test configuration exists for 100 concurrent users, 30 minutes.
 * Actual load test requires running infrastructure.
 */
describe('T-P0-020: Load Test Configuration', () => {
  it('should have performance baseline document', () => {
    const fs = require('fs');
    const path = require('path');
    const baseline = fs.readFileSync(
      path.join(__dirname, '../../docs/phase-0/DOC-P0-008-baseline-report.md'),
      'utf8',
    );
    expect(baseline).toContain('100');
    expect(baseline).toContain('30m');
    expect(baseline).toContain('p(95)<200');
  });

  it('should define performance targets', () => {
    const fs = require('fs');
    const path = require('path');
    const baseline = fs.readFileSync(
      path.join(__dirname, '../../docs/phase-0/DOC-P0-008-baseline-report.md'),
      'utf8',
    );
    expect(baseline).toContain('50ms');
    expect(baseline).toContain('10ms');
    expect(baseline).toContain('200ms');
  });
});
