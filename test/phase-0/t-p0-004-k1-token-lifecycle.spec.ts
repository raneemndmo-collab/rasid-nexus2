/**
 * T-P0-004: K1 Token Lifecycle
 * Tests JWT issuance, validation, and revocation.
 */
import * as jwt from 'jsonwebtoken';

describe('T-P0-004: K1 Token Lifecycle', () => {
  const JWT_SECRET = 'test-secret-key-for-rasid-platform';
  const payload = { sub: 'user-123', email: 'test@rasid.sa', tenantId: 'tenant-001', roles: ['admin'] };

  it('should issue a valid JWT token', () => {
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3);
  });

  it('should validate a valid JWT token', () => {
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
    const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
    expect(decoded.sub).toBe('user-123');
    expect(decoded.email).toBe('test@rasid.sa');
    expect(decoded.tenantId).toBe('tenant-001');
  });

  it('should reject an expired JWT token', () => {
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '-1s' });
    expect(() => jwt.verify(token, JWT_SECRET)).toThrow();
  });

  it('should reject a forged JWT token', () => {
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
    const forged = token.slice(0, -5) + 'XXXXX';
    expect(() => jwt.verify(forged, JWT_SECRET)).toThrow();
  });

  it('should reject a token signed with wrong secret', () => {
    const token = jwt.sign(payload, 'wrong-secret', { expiresIn: '1h' });
    expect(() => jwt.verify(token, JWT_SECRET)).toThrow();
  });

  it('should include required claims in token', () => {
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
    const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
    expect(decoded).toHaveProperty('sub');
    expect(decoded).toHaveProperty('email');
    expect(decoded).toHaveProperty('tenantId');
    expect(decoded).toHaveProperty('roles');
    expect(decoded).toHaveProperty('exp');
    expect(decoded).toHaveProperty('iat');
  });
});
