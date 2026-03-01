/**
 * T-P0-024: K1 Token Performance
 * Measures JWT issuance and validation performance.
 * Target: Issuance < 50ms p95, Validation < 10ms p95.
 */
import * as jwt from 'jsonwebtoken';

describe('T-P0-024: K1 Token Performance', () => {
  const JWT_SECRET = 'test-secret-key-for-rasid-platform';
  const payload = { sub: 'user-123', email: 'test@rasid.sa', tenantId: 'tenant-001', roles: ['admin'] };
  const ITERATIONS = 1000;

  it('should issue tokens within 50ms p95', () => {
    const times: number[] = [];
    for (let i = 0; i < ITERATIONS; i++) {
      const start = process.hrtime.bigint();
      jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
      const end = process.hrtime.bigint();
      times.push(Number(end - start) / 1_000_000); // Convert to ms
    }
    times.sort((a, b) => a - b);
    const p95 = times[Math.floor(ITERATIONS * 0.95)];
    console.log(`Token Issuance p95: ${p95.toFixed(3)}ms`);
    expect(p95).toBeLessThan(50);
  });

  it('should validate tokens within 10ms p95', () => {
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
    const times: number[] = [];
    for (let i = 0; i < ITERATIONS; i++) {
      const start = process.hrtime.bigint();
      jwt.verify(token, JWT_SECRET);
      const end = process.hrtime.bigint();
      times.push(Number(end - start) / 1_000_000);
    }
    times.sort((a, b) => a - b);
    const p95 = times[Math.floor(ITERATIONS * 0.95)];
    console.log(`Token Validation p95: ${p95.toFixed(3)}ms`);
    expect(p95).toBeLessThan(10);
  });
});
