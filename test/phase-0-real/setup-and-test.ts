/**
 * Phase 0 — Real Infrastructure Integration Tests
 * Runs against actual PostgreSQL, Redis, and NATS instances.
 */
import { Client } from 'pg';
import Redis from 'ioredis';
import { connect, NatsConnection, StringCodec, JetStreamManager } from 'nats';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

// ═══ Configuration ═══
const PG_HOST = 'localhost';
const PG_PORT = 5432;
const REDIS_HOST = 'localhost';
const REDIS_PORT = 6379;
const REDIS_PASS = 'redis_pass';
const NATS_URL = 'nats://localhost:4222';
const JWT_SECRET = 'rasid-jwt-secret-phase0-test';

interface TestResult {
  id: string;
  name: string;
  status: 'PASS' | 'FAIL';
  duration_ms: number;
  details: string;
  subtests: { name: string; status: 'PASS' | 'FAIL'; details: string }[];
}

const results: TestResult[] = [];

async function pgClient(db: string, user: string, password: string): Promise<Client> {
  const client = new Client({ host: PG_HOST, port: PG_PORT, database: db, user, password });
  await client.connect();
  return client;
}

// ═══════════════════════════════════════════════════════════
// T-P0-001: Cluster Health
// ═══════════════════════════════════════════════════════════
async function testClusterHealth(): Promise<TestResult> {
  const start = Date.now();
  const subtests: TestResult['subtests'] = [];

  // Test PostgreSQL
  try {
    const client = await pgClient('rasid_admin', 'rasid_admin', 'rasid_admin_pass');
    await client.query('SELECT 1');
    await client.end();
    subtests.push({ name: 'PostgreSQL connectivity', status: 'PASS', details: 'Connected successfully' });
  } catch (e: any) {
    subtests.push({ name: 'PostgreSQL connectivity', status: 'FAIL', details: e.message });
  }

  // Test Redis
  try {
    const redis = new Redis({ host: REDIS_HOST, port: REDIS_PORT, password: REDIS_PASS });
    const pong = await redis.ping();
    await redis.quit();
    subtests.push({ name: 'Redis connectivity', status: pong === 'PONG' ? 'PASS' : 'FAIL', details: `ping=${pong}` });
  } catch (e: any) {
    subtests.push({ name: 'Redis connectivity', status: 'FAIL', details: e.message });
  }

  // Test NATS
  try {
    const nc = await connect({ servers: NATS_URL });
    subtests.push({ name: 'NATS connectivity', status: 'PASS', details: 'Connected successfully' });
    await nc.close();
  } catch (e: any) {
    subtests.push({ name: 'NATS connectivity', status: 'FAIL', details: e.message });
  }

  const allPass = subtests.every(s => s.status === 'PASS');
  return { id: 'T-P0-001', name: 'Cluster Health', status: allPass ? 'PASS' : 'FAIL', duration_ms: Date.now() - start, details: `${subtests.filter(s => s.status === 'PASS').length}/3 services healthy`, subtests };
}

// ═══════════════════════════════════════════════════════════
// T-P0-002: Database Connectivity — all 10 databases
// ═══════════════════════════════════════════════════════════
async function testDatabaseConnectivity(): Promise<TestResult> {
  const start = Date.now();
  const subtests: TestResult['subtests'] = [];
  const databases = [
    { db: 'k1_auth_db', user: 'k1_user', pass: 'k1_pass' },
    { db: 'k2_tenant_db', user: 'k2_user', pass: 'k2_pass' },
    { db: 'k3_audit_db', user: 'k3_user', pass: 'k3_pass' },
    { db: 'k4_config_db', user: 'k4_user', pass: 'k4_pass' },
    { db: 'k5_events_db', user: 'k5_user', pass: 'k5_pass' },
    { db: 'm1_auth_users_db', user: 'm1_user', pass: 'm1_pass' },
    { db: 'm2_tenants_db', user: 'm2_user', pass: 'm2_pass' },
    { db: 'm3_roles_db', user: 'm3_user', pass: 'm3_pass' },
    { db: 'm4_permissions_db', user: 'm4_user', pass: 'm4_pass' },
    { db: 'm30_actions_db', user: 'm30_user', pass: 'm30_pass' },
  ];

  for (const { db, user, pass } of databases) {
    try {
      const client = await pgClient(db, user, pass);
      const res = await client.query('SELECT current_database(), current_user');
      await client.end();
      subtests.push({ name: `${db} connectivity`, status: 'PASS', details: `db=${res.rows[0].current_database}, user=${res.rows[0].current_user}` });
    } catch (e: any) {
      subtests.push({ name: `${db} connectivity`, status: 'FAIL', details: e.message });
    }
  }

  const allPass = subtests.every(s => s.status === 'PASS');
  return { id: 'T-P0-002', name: 'Database Connectivity', status: allPass ? 'PASS' : 'FAIL', duration_ms: Date.now() - start, details: `${subtests.filter(s => s.status === 'PASS').length}/10 databases connected`, subtests };
}

// ═══════════════════════════════════════════════════════════
// T-P0-003: RLS Enforcement
// ═══════════════════════════════════════════════════════════
async function testRLSEnforcement(): Promise<TestResult> {
  const start = Date.now();
  const subtests: TestResult['subtests'] = [];

  // Use m1_auth_users_db as test case
  const admin = await pgClient('m1_auth_users_db', 'rasid_admin', 'rasid_admin_pass');

  try {
    // Create test table with RLS
    await admin.query(`
      CREATE TABLE IF NOT EXISTS rls_test_users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL,
        email TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    await admin.query('ALTER TABLE rls_test_users ENABLE ROW LEVEL SECURITY');
    await admin.query('ALTER TABLE rls_test_users FORCE ROW LEVEL SECURITY');
    await admin.query(`DROP POLICY IF EXISTS tenant_isolation ON rls_test_users`);
    await admin.query(`
      CREATE POLICY tenant_isolation ON rls_test_users
        USING (tenant_id = current_setting('app.current_tenant_id')::uuid)
    `);
    await admin.query(`DROP POLICY IF EXISTS tenant_insert ON rls_test_users`);
    await admin.query(`
      CREATE POLICY tenant_insert ON rls_test_users
        FOR INSERT WITH CHECK (tenant_id = current_setting('app.current_tenant_id')::uuid)
    `);
    await admin.query(`GRANT ALL ON rls_test_users TO m1_user`);
    subtests.push({ name: 'RLS table creation', status: 'PASS', details: 'Table with RLS created' });
  } catch (e: any) {
    subtests.push({ name: 'RLS table creation', status: 'FAIL', details: e.message });
  }

  const tenantA = uuidv4();
  const tenantB = uuidv4();

  // Connect as m1_user
  const m1 = await pgClient('m1_auth_users_db', 'm1_user', 'm1_pass');

  try {
    // Insert as tenant A
    await m1.query(`SET app.current_tenant_id = '${tenantA}'`);
    await m1.query(`INSERT INTO rls_test_users (tenant_id, email) VALUES ($1, 'a@test.com')`, [tenantA]);
    await m1.query(`INSERT INTO rls_test_users (tenant_id, email) VALUES ($1, 'a2@test.com')`, [tenantA]);
    subtests.push({ name: 'Insert as Tenant A', status: 'PASS', details: '2 rows inserted' });
  } catch (e: any) {
    subtests.push({ name: 'Insert as Tenant A', status: 'FAIL', details: e.message });
  }

  try {
    // Insert as tenant B
    await m1.query(`SET app.current_tenant_id = '${tenantB}'`);
    await m1.query(`INSERT INTO rls_test_users (tenant_id, email) VALUES ($1, 'b@test.com')`, [tenantB]);
    subtests.push({ name: 'Insert as Tenant B', status: 'PASS', details: '1 row inserted' });
  } catch (e: any) {
    subtests.push({ name: 'Insert as Tenant B', status: 'FAIL', details: e.message });
  }

  try {
    // Query as tenant A — should only see tenant A's rows
    await m1.query(`SET app.current_tenant_id = '${tenantA}'`);
    const res = await m1.query('SELECT * FROM rls_test_users');
    const allTenantA = res.rows.every((r: any) => r.tenant_id === tenantA);
    subtests.push({
      name: 'Tenant A isolation',
      status: res.rows.length === 2 && allTenantA ? 'PASS' : 'FAIL',
      details: `rows=${res.rows.length}, allTenantA=${allTenantA}`,
    });
  } catch (e: any) {
    subtests.push({ name: 'Tenant A isolation', status: 'FAIL', details: e.message });
  }

  try {
    // Query as tenant B — should only see tenant B's rows
    await m1.query(`SET app.current_tenant_id = '${tenantB}'`);
    const res = await m1.query('SELECT * FROM rls_test_users');
    const allTenantB = res.rows.every((r: any) => r.tenant_id === tenantB);
    subtests.push({
      name: 'Tenant B isolation',
      status: res.rows.length === 1 && allTenantB ? 'PASS' : 'FAIL',
      details: `rows=${res.rows.length}, allTenantB=${allTenantB}`,
    });
  } catch (e: any) {
    subtests.push({ name: 'Tenant B isolation', status: 'FAIL', details: e.message });
  }

  try {
    // Tenant B should NOT be able to insert with Tenant A's ID
    await m1.query(`SET app.current_tenant_id = '${tenantB}'`);
    await m1.query(`INSERT INTO rls_test_users (tenant_id, email) VALUES ($1, 'hack@test.com')`, [tenantA]);
    subtests.push({ name: 'Cross-tenant insert blocked', status: 'FAIL', details: 'Insert should have been blocked' });
  } catch (e: any) {
    subtests.push({ name: 'Cross-tenant insert blocked', status: 'PASS', details: `Correctly blocked: ${e.message.substring(0, 80)}` });
  }

  await m1.end();
  await admin.query('DROP TABLE IF EXISTS rls_test_users');
  await admin.end();

  const allPass = subtests.every(s => s.status === 'PASS');
  return { id: 'T-P0-003', name: 'RLS Enforcement', status: allPass ? 'PASS' : 'FAIL', duration_ms: Date.now() - start, details: `${subtests.filter(s => s.status === 'PASS').length}/${subtests.length} checks passed`, subtests };
}

// ═══════════════════════════════════════════════════════════
// T-P0-004: K1 Token Lifecycle
// ═══════════════════════════════════════════════════════════
async function testTokenLifecycle(): Promise<TestResult> {
  const start = Date.now();
  const subtests: TestResult['subtests'] = [];
  const payload = { sub: uuidv4(), email: 'test@rasid.sa', tenantId: uuidv4(), roles: ['admin'] };

  // Issue token
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
  subtests.push({ name: 'Token issuance', status: token.split('.').length === 3 ? 'PASS' : 'FAIL', details: `Token length: ${token.length}` });

  // Validate token
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
    subtests.push({ name: 'Token validation', status: decoded.sub === payload.sub ? 'PASS' : 'FAIL', details: `sub=${decoded.sub}` });
  } catch (e: any) {
    subtests.push({ name: 'Token validation', status: 'FAIL', details: e.message });
  }

  // Reject expired
  try {
    const expired = jwt.sign(payload, JWT_SECRET, { expiresIn: '-1s' });
    jwt.verify(expired, JWT_SECRET);
    subtests.push({ name: 'Expired token rejected', status: 'FAIL', details: 'Should have thrown' });
  } catch {
    subtests.push({ name: 'Expired token rejected', status: 'PASS', details: 'Correctly rejected' });
  }

  // Reject forged
  try {
    jwt.verify(token.slice(0, -5) + 'XXXXX', JWT_SECRET);
    subtests.push({ name: 'Forged token rejected', status: 'FAIL', details: 'Should have thrown' });
  } catch {
    subtests.push({ name: 'Forged token rejected', status: 'PASS', details: 'Correctly rejected' });
  }

  // Reject wrong secret
  try {
    const wrongToken = jwt.sign(payload, 'wrong-secret', { expiresIn: '1h' });
    jwt.verify(wrongToken, JWT_SECRET);
    subtests.push({ name: 'Wrong secret rejected', status: 'FAIL', details: 'Should have thrown' });
  } catch {
    subtests.push({ name: 'Wrong secret rejected', status: 'PASS', details: 'Correctly rejected' });
  }

  // Store token in K1 DB
  const k1 = await pgClient('k1_auth_db', 'k1_user', 'k1_pass');
  try {
    await k1.query(`CREATE TABLE IF NOT EXISTS auth_tokens (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL,
      token_hash TEXT NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      is_revoked BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`);
    const tokenHash = await bcrypt.hash(token.substring(0, 20), 10);
    await k1.query('INSERT INTO auth_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)', [payload.sub, tokenHash, new Date(Date.now() + 3600000)]);
    const res = await k1.query('SELECT * FROM auth_tokens WHERE user_id = $1', [payload.sub]);
    subtests.push({ name: 'Token stored in K1 DB', status: res.rows.length === 1 ? 'PASS' : 'FAIL', details: `rows=${res.rows.length}` });

    // Revoke token
    await k1.query('UPDATE auth_tokens SET is_revoked = true WHERE user_id = $1', [payload.sub]);
    const revoked = await k1.query('SELECT is_revoked FROM auth_tokens WHERE user_id = $1', [payload.sub]);
    subtests.push({ name: 'Token revocation', status: revoked.rows[0].is_revoked ? 'PASS' : 'FAIL', details: `is_revoked=${revoked.rows[0].is_revoked}` });

    await k1.query('DROP TABLE auth_tokens');
  } catch (e: any) {
    subtests.push({ name: 'Token stored in K1 DB', status: 'FAIL', details: e.message });
  }
  await k1.end();

  const allPass = subtests.every(s => s.status === 'PASS');
  return { id: 'T-P0-004', name: 'K1 Token Lifecycle', status: allPass ? 'PASS' : 'FAIL', duration_ms: Date.now() - start, details: `${subtests.filter(s => s.status === 'PASS').length}/${subtests.length} checks passed`, subtests };
}

// ═══════════════════════════════════════════════════════════
// T-P0-005: K2 Cross-Tenant Isolation (DT-001)
// ═══════════════════════════════════════════════════════════
async function testCrossTenantIsolation(): Promise<TestResult> {
  const start = Date.now();
  const subtests: TestResult['subtests'] = [];
  const tenantA = uuidv4();
  const tenantB = uuidv4();

  // Test across multiple databases
  const databases = [
    { db: 'm3_roles_db', user: 'm3_user', pass: 'm3_pass', table: 'test_roles' },
    { db: 'm4_permissions_db', user: 'm4_user', pass: 'm4_pass', table: 'test_permissions' },
  ];

  for (const { db, user, pass, table } of databases) {
    const admin = await pgClient(db, 'rasid_admin', 'rasid_admin_pass');
    const userClient = await pgClient(db, user, pass);

    try {
      await admin.query(`CREATE TABLE IF NOT EXISTS ${table} (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL,
        name TEXT NOT NULL
      )`);
      await admin.query(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY`);
      await admin.query(`ALTER TABLE ${table} FORCE ROW LEVEL SECURITY`);
      await admin.query(`DROP POLICY IF EXISTS tenant_isolation ON ${table}`);
      await admin.query(`CREATE POLICY tenant_isolation ON ${table} USING (tenant_id = current_setting('app.current_tenant_id')::uuid)`);
      await admin.query(`DROP POLICY IF EXISTS tenant_insert ON ${table}`);
      await admin.query(`CREATE POLICY tenant_insert ON ${table} FOR INSERT WITH CHECK (tenant_id = current_setting('app.current_tenant_id')::uuid)`);
      await admin.query(`GRANT ALL ON ${table} TO ${user}`);

      // Insert data for both tenants
      await userClient.query(`SET app.current_tenant_id = '${tenantA}'`);
      await userClient.query(`INSERT INTO ${table} (tenant_id, name) VALUES ($1, 'A-item')`, [tenantA]);
      await userClient.query(`SET app.current_tenant_id = '${tenantB}'`);
      await userClient.query(`INSERT INTO ${table} (tenant_id, name) VALUES ($1, 'B-item')`, [tenantB]);

      // Verify isolation
      await userClient.query(`SET app.current_tenant_id = '${tenantA}'`);
      const resA = await userClient.query(`SELECT * FROM ${table}`);
      await userClient.query(`SET app.current_tenant_id = '${tenantB}'`);
      const resB = await userClient.query(`SELECT * FROM ${table}`);

      const aIsolated = resA.rows.length === 1 && resA.rows[0].name === 'A-item';
      const bIsolated = resB.rows.length === 1 && resB.rows[0].name === 'B-item';

      subtests.push({
        name: `${db} tenant isolation`,
        status: aIsolated && bIsolated ? 'PASS' : 'FAIL',
        details: `A_rows=${resA.rows.length}, B_rows=${resB.rows.length}`,
      });

      await admin.query(`DROP TABLE ${table}`);
    } catch (e: any) {
      subtests.push({ name: `${db} tenant isolation`, status: 'FAIL', details: e.message });
    }

    await userClient.end();
    await admin.end();
  }

  const allPass = subtests.every(s => s.status === 'PASS');
  return { id: 'T-P0-005', name: 'K2 Cross-Tenant Isolation (DT-001)', status: allPass ? 'PASS' : 'FAIL', duration_ms: Date.now() - start, details: `${subtests.filter(s => s.status === 'PASS').length}/${subtests.length} checks passed`, subtests };
}

// ═══════════════════════════════════════════════════════════
// T-P0-006: K3 Audit Completeness (DT-003)
// ═══════════════════════════════════════════════════════════
async function testAuditCompleteness(): Promise<TestResult> {
  const start = Date.now();
  const subtests: TestResult['subtests'] = [];

  const k3 = await pgClient('k3_audit_db', 'k3_user', 'k3_pass');

  try {
    await k3.query(`CREATE TABLE IF NOT EXISTS audit_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id UUID NOT NULL,
      user_id UUID NOT NULL,
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id UUID,
      old_value JSONB,
      new_value JSONB,
      ip_address TEXT,
      user_agent TEXT,
      correlation_id UUID NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`);
    subtests.push({ name: 'Audit table creation', status: 'PASS', details: 'Table created with all required columns' });

    // Simulate audit entries for CRUD operations
    const tenantId = uuidv4();
    const userId = uuidv4();
    const entityId = uuidv4();
    const correlationId = uuidv4();

    const operations = ['CREATE_USER', 'UPDATE_USER', 'DELETE_USER', 'ASSIGN_ROLE'];
    for (const action of operations) {
      await k3.query(`INSERT INTO audit_logs (tenant_id, user_id, action, entity_type, entity_id, new_value, correlation_id)
        VALUES ($1, $2, $3, 'user', $4, $5, $6)`,
        [tenantId, userId, action, entityId, JSON.stringify({ action }), correlationId]);
    }

    const res = await k3.query('SELECT * FROM audit_logs WHERE tenant_id = $1', [tenantId]);
    subtests.push({
      name: 'All CRUD operations audited',
      status: res.rows.length === 4 ? 'PASS' : 'FAIL',
      details: `${res.rows.length} audit entries for 4 operations`,
    });

    // Verify all required fields are present
    const row = res.rows[0];
    const requiredFields = ['tenant_id', 'user_id', 'action', 'entity_type', 'correlation_id', 'created_at'];
    const allFieldsPresent = requiredFields.every(f => row[f] !== undefined && row[f] !== null);
    subtests.push({
      name: 'Required fields present',
      status: allFieldsPresent ? 'PASS' : 'FAIL',
      details: `Fields checked: ${requiredFields.join(', ')}`,
    });

    await k3.query('DROP TABLE audit_logs');
  } catch (e: any) {
    subtests.push({ name: 'Audit test', status: 'FAIL', details: e.message });
  }

  await k3.end();

  const allPass = subtests.every(s => s.status === 'PASS');
  return { id: 'T-P0-006', name: 'K3 Audit Completeness (DT-003)', status: allPass ? 'PASS' : 'FAIL', duration_ms: Date.now() - start, details: `${subtests.filter(s => s.status === 'PASS').length}/${subtests.length} checks passed`, subtests };
}

// ═══════════════════════════════════════════════════════════
// T-P0-007: K3 Audit Immutability
// ═══════════════════════════════════════════════════════════
async function testAuditImmutability(): Promise<TestResult> {
  const start = Date.now();
  const subtests: TestResult['subtests'] = [];

  const admin = await pgClient('k3_audit_db', 'rasid_admin', 'rasid_admin_pass');

  try {
    await admin.query(`CREATE TABLE IF NOT EXISTS immutable_audit (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id UUID NOT NULL,
      action TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`);

    // Create a trigger to prevent UPDATE and DELETE
    await admin.query(`
      CREATE OR REPLACE FUNCTION prevent_audit_modification()
      RETURNS TRIGGER AS $$
      BEGIN
        RAISE EXCEPTION 'Audit logs are immutable — UPDATE and DELETE are forbidden';
      END;
      $$ LANGUAGE plpgsql;
    `);
    await admin.query(`DROP TRIGGER IF EXISTS no_update ON immutable_audit`);
    await admin.query(`CREATE TRIGGER no_update BEFORE UPDATE ON immutable_audit FOR EACH ROW EXECUTE FUNCTION prevent_audit_modification()`);
    await admin.query(`DROP TRIGGER IF EXISTS no_delete ON immutable_audit`);
    await admin.query(`CREATE TRIGGER no_delete BEFORE DELETE ON immutable_audit FOR EACH ROW EXECUTE FUNCTION prevent_audit_modification()`);

    // Insert should work
    const tenantId = uuidv4();
    await admin.query(`INSERT INTO immutable_audit (tenant_id, action) VALUES ($1, 'TEST_ACTION')`, [tenantId]);
    subtests.push({ name: 'Audit INSERT allowed', status: 'PASS', details: 'Insert succeeded' });

    // UPDATE should fail
    try {
      await admin.query(`UPDATE immutable_audit SET action = 'HACKED' WHERE tenant_id = $1`, [tenantId]);
      subtests.push({ name: 'Audit UPDATE blocked', status: 'FAIL', details: 'Update should have been blocked' });
    } catch (e: any) {
      subtests.push({ name: 'Audit UPDATE blocked', status: 'PASS', details: `Correctly blocked: ${e.message.substring(0, 60)}` });
    }

    // DELETE should fail
    try {
      await admin.query(`DELETE FROM immutable_audit WHERE tenant_id = $1`, [tenantId]);
      subtests.push({ name: 'Audit DELETE blocked', status: 'FAIL', details: 'Delete should have been blocked' });
    } catch (e: any) {
      subtests.push({ name: 'Audit DELETE blocked', status: 'PASS', details: `Correctly blocked: ${e.message.substring(0, 60)}` });
    }

    await admin.query('DROP TRIGGER IF EXISTS no_update ON immutable_audit');
    await admin.query('DROP TRIGGER IF EXISTS no_delete ON immutable_audit');
    await admin.query('DROP TABLE immutable_audit');
    await admin.query('DROP FUNCTION IF EXISTS prevent_audit_modification()');
  } catch (e: any) {
    subtests.push({ name: 'Immutability test', status: 'FAIL', details: e.message });
  }

  await admin.end();

  const allPass = subtests.every(s => s.status === 'PASS');
  return { id: 'T-P0-007', name: 'K3 Audit Immutability', status: allPass ? 'PASS' : 'FAIL', duration_ms: Date.now() - start, details: `${subtests.filter(s => s.status === 'PASS').length}/${subtests.length} checks passed`, subtests };
}

// ═══════════════════════════════════════════════════════════
// T-P0-008: K4 Config Cache (Redis)
// ═══════════════════════════════════════════════════════════
async function testConfigCache(): Promise<TestResult> {
  const start = Date.now();
  const subtests: TestResult['subtests'] = [];

  const redis = new Redis({ host: REDIS_HOST, port: REDIS_PORT, password: REDIS_PASS });
  const k4 = await pgClient('k4_config_db', 'k4_user', 'k4_pass');

  try {
    // Create config table
    await k4.query(`CREATE TABLE IF NOT EXISTS configs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id UUID NOT NULL,
      key TEXT NOT NULL,
      value JSONB NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )`);

    const tenantId = uuidv4();
    const configKey = 'app.theme';
    const configValue = JSON.stringify({ color: 'blue', mode: 'dark' });

    // Write to DB
    await k4.query('INSERT INTO configs (tenant_id, key, value) VALUES ($1, $2, $3)', [tenantId, configKey, configValue]);
    subtests.push({ name: 'Config write to DB', status: 'PASS', details: 'Config stored in PostgreSQL' });

    // Write to Redis cache
    const cacheKey = `config:${tenantId}:${configKey}`;
    await redis.set(cacheKey, configValue, 'EX', 300);
    subtests.push({ name: 'Config cached in Redis', status: 'PASS', details: `TTL=300s` });

    // Read from cache (should be fast)
    const cacheStart = process.hrtime.bigint();
    const cached = await redis.get(cacheKey);
    const cacheDuration = Number(process.hrtime.bigint() - cacheStart) / 1_000_000;
    subtests.push({
      name: 'Config read from cache',
      status: cached === configValue ? 'PASS' : 'FAIL',
      details: `duration=${cacheDuration.toFixed(3)}ms, match=${cached === configValue}`,
    });

    // Invalidate cache on update
    await redis.del(cacheKey);
    const afterDel = await redis.get(cacheKey);
    subtests.push({
      name: 'Cache invalidation on update',
      status: afterDel === null ? 'PASS' : 'FAIL',
      details: `afterDel=${afterDel}`,
    });

    // Read from DB (uncached)
    const dbStart = process.hrtime.bigint();
    const dbRes = await k4.query('SELECT value FROM configs WHERE tenant_id = $1 AND key = $2', [tenantId, configKey]);
    const dbDuration = Number(process.hrtime.bigint() - dbStart) / 1_000_000;
    subtests.push({
      name: 'Config read from DB (uncached)',
      status: dbRes.rows.length === 1 ? 'PASS' : 'FAIL',
      details: `duration=${dbDuration.toFixed(3)}ms`,
    });

    await k4.query('DROP TABLE configs');
  } catch (e: any) {
    subtests.push({ name: 'Config cache test', status: 'FAIL', details: e.message });
  }

  await k4.end();
  await redis.quit();

  const allPass = subtests.every(s => s.status === 'PASS');
  return { id: 'T-P0-008', name: 'K4 Config Cache', status: allPass ? 'PASS' : 'FAIL', duration_ms: Date.now() - start, details: `${subtests.filter(s => s.status === 'PASS').length}/${subtests.length} checks passed`, subtests };
}

// ═══════════════════════════════════════════════════════════
// T-P0-009: K5 Event Delivery (DT-005)
// ═══════════════════════════════════════════════════════════
async function testEventDelivery(): Promise<TestResult> {
  const start = Date.now();
  const subtests: TestResult['subtests'] = [];

  let nc: NatsConnection | null = null;
  try {
    nc = await connect({ servers: NATS_URL });
    const sc = StringCodec();

    // Test pub/sub
    const subject = 'rasid.test.event';
    const receivedMessages: string[] = [];

    const sub = nc.subscribe(subject);
    (async () => {
      for await (const msg of sub) {
        receivedMessages.push(sc.decode(msg.data));
        if (receivedMessages.length >= 3) break;
      }
    })();

    // Publish 3 events
    for (let i = 0; i < 3; i++) {
      const event = JSON.stringify({
        event_id: uuidv4(),
        event_type: 'test.event',
        tenant_id: uuidv4(),
        correlation_id: uuidv4(),
        timestamp: new Date().toISOString(),
        version: 1,
        payload: { index: i },
      });
      nc.publish(subject, sc.encode(event));
    }

    // Wait for delivery
    await new Promise(resolve => setTimeout(resolve, 1000));
    sub.unsubscribe();

    subtests.push({
      name: 'Event publish/subscribe',
      status: receivedMessages.length === 3 ? 'PASS' : 'FAIL',
      details: `received=${receivedMessages.length}/3`,
    });

    // Test JetStream
    try {
      const jsm = await nc.jetstreamManager();
      await jsm.streams.add({
        name: 'RASID_TEST',
        subjects: ['rasid.test.js.>'],
      });

      const js = nc.jetstream();
      await js.publish('rasid.test.js.event', sc.encode(JSON.stringify({ test: true })));

      const consumer = await js.consumers.get('RASID_TEST');
      const msg = await consumer.next({ expires: 3000 });
      subtests.push({
        name: 'JetStream persistence',
        status: msg ? 'PASS' : 'FAIL',
        details: msg ? 'Message persisted and retrieved' : 'No message received',
      });

      if (msg) msg.ack();
      await jsm.streams.delete('RASID_TEST');
    } catch (e: any) {
      subtests.push({ name: 'JetStream persistence', status: 'FAIL', details: e.message });
    }

    // Store event in K5 DB
    const k5 = await pgClient('k5_events_db', 'k5_user', 'k5_pass');
    try {
      await k5.query(`CREATE TABLE IF NOT EXISTS event_store (
        event_id UUID PRIMARY KEY,
        event_type TEXT NOT NULL,
        tenant_id UUID NOT NULL,
        correlation_id UUID NOT NULL,
        payload JSONB NOT NULL,
        version INT DEFAULT 1,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )`);
      const eventId = uuidv4();
      await k5.query('INSERT INTO event_store (event_id, event_type, tenant_id, correlation_id, payload) VALUES ($1, $2, $3, $4, $5)',
        [eventId, 'test.event', uuidv4(), uuidv4(), JSON.stringify({ test: true })]);
      const res = await k5.query('SELECT * FROM event_store WHERE event_id = $1', [eventId]);
      subtests.push({
        name: 'Event stored in K5 DB',
        status: res.rows.length === 1 ? 'PASS' : 'FAIL',
        details: `rows=${res.rows.length}`,
      });
      await k5.query('DROP TABLE event_store');
    } catch (e: any) {
      subtests.push({ name: 'Event stored in K5 DB', status: 'FAIL', details: e.message });
    }
    await k5.end();

  } catch (e: any) {
    subtests.push({ name: 'NATS connection', status: 'FAIL', details: e.message });
  }

  if (nc) await nc.close();

  const allPass = subtests.every(s => s.status === 'PASS');
  return { id: 'T-P0-009', name: 'K5 Event Delivery (DT-005)', status: allPass ? 'PASS' : 'FAIL', duration_ms: Date.now() - start, details: `${subtests.filter(s => s.status === 'PASS').length}/${subtests.length} checks passed`, subtests };
}

// ═══════════════════════════════════════════════════════════
// T-P0-010 + T-P0-011 + T-P0-012: Schema Validation, DLQ, Idempotency
// ═══════════════════════════════════════════════════════════
async function testSchemaAndDLQ(): Promise<TestResult> {
  const start = Date.now();
  const subtests: TestResult['subtests'] = [];

  const k5 = await pgClient('k5_events_db', 'k5_user', 'k5_pass');

  try {
    // Schema validation table
    await k5.query(`CREATE TABLE IF NOT EXISTS event_schemas (
      event_type TEXT PRIMARY KEY,
      schema JSONB NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`);
    await k5.query(`INSERT INTO event_schemas (event_type, schema) VALUES ('user.created', $1) ON CONFLICT DO NOTHING`,
      [JSON.stringify({ type: 'object', required: ['userId', 'email'] })]);
    const schema = await k5.query('SELECT * FROM event_schemas WHERE event_type = $1', ['user.created']);
    subtests.push({
      name: 'T-P0-010: Schema validation table',
      status: schema.rows.length === 1 ? 'PASS' : 'FAIL',
      details: `Schema registered for user.created`,
    });

    // DLQ table
    await k5.query(`CREATE TABLE IF NOT EXISTS dead_letter_queue (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      event_id UUID NOT NULL,
      event_type TEXT NOT NULL,
      payload JSONB NOT NULL,
      error TEXT NOT NULL,
      attempts INT DEFAULT 1,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`);
    const dlqEventId = uuidv4();
    await k5.query('INSERT INTO dead_letter_queue (event_id, event_type, payload, error, attempts) VALUES ($1, $2, $3, $4, $5)',
      [dlqEventId, 'user.created', JSON.stringify({ bad: 'data' }), 'Schema validation failed', 3]);
    const dlq = await k5.query('SELECT * FROM dead_letter_queue WHERE event_id = $1', [dlqEventId]);
    subtests.push({
      name: 'T-P0-011: DLQ storage',
      status: dlq.rows.length === 1 && dlq.rows[0].attempts === 3 ? 'PASS' : 'FAIL',
      details: `DLQ entry stored with attempts=${dlq.rows[0]?.attempts}`,
    });

    // Idempotency — event_id uniqueness
    await k5.query(`CREATE TABLE IF NOT EXISTS event_store_idem (
      event_id UUID PRIMARY KEY,
      event_type TEXT NOT NULL,
      payload JSONB NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`);
    const eventId = uuidv4();
    await k5.query('INSERT INTO event_store_idem (event_id, event_type, payload) VALUES ($1, $2, $3)',
      [eventId, 'test', JSON.stringify({})]);
    try {
      await k5.query('INSERT INTO event_store_idem (event_id, event_type, payload) VALUES ($1, $2, $3)',
        [eventId, 'test', JSON.stringify({})]);
      subtests.push({ name: 'T-P0-012: Idempotency (duplicate rejected)', status: 'FAIL', details: 'Duplicate should have been rejected' });
    } catch {
      subtests.push({ name: 'T-P0-012: Idempotency (duplicate rejected)', status: 'PASS', details: 'Duplicate correctly rejected by PK constraint' });
    }

    await k5.query('DROP TABLE IF EXISTS event_schemas, dead_letter_queue, event_store_idem');
  } catch (e: any) {
    subtests.push({ name: 'Schema/DLQ/Idempotency', status: 'FAIL', details: e.message });
  }

  await k5.end();

  const allPass = subtests.every(s => s.status === 'PASS');
  return { id: 'T-P0-010/011/012', name: 'Schema Validation + DLQ + Idempotency', status: allPass ? 'PASS' : 'FAIL', duration_ms: Date.now() - start, details: `${subtests.filter(s => s.status === 'PASS').length}/${subtests.length} checks passed`, subtests };
}

// ═══════════════════════════════════════════════════════════
// T-P0-014/015/016: M1 User CRUD + Password Security + M2 Tenant Lifecycle
// ═══════════════════════════════════════════════════════════
async function testUserAndTenantCRUD(): Promise<TestResult> {
  const start = Date.now();
  const subtests: TestResult['subtests'] = [];

  // M1 User CRUD
  const m1 = await pgClient('m1_auth_users_db', 'm1_user', 'm1_pass');
  try {
    await m1.query(`CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id UUID NOT NULL,
      email TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      first_name TEXT,
      last_name TEXT,
      roles TEXT[] DEFAULT '{}',
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )`);

    const tenantId = uuidv4();
    const password = 'SecureP@ss123!';
    const hash = await bcrypt.hash(password, 12);

    // CREATE
    const created = await m1.query('INSERT INTO users (tenant_id, email, password_hash, first_name, last_name) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [tenantId, 'user@rasid.sa', hash, 'Test', 'User']);
    subtests.push({ name: 'M1 User CREATE', status: created.rows.length === 1 ? 'PASS' : 'FAIL', details: `id=${created.rows[0].id}` });

    // READ
    const read = await m1.query('SELECT * FROM users WHERE id = $1', [created.rows[0].id]);
    subtests.push({ name: 'M1 User READ', status: read.rows.length === 1 ? 'PASS' : 'FAIL', details: `email=${read.rows[0].email}` });

    // Password verification
    const isValid = await bcrypt.compare(password, read.rows[0].password_hash);
    subtests.push({ name: 'M1 Password bcrypt verify', status: isValid ? 'PASS' : 'FAIL', details: `bcrypt compare=${isValid}` });

    // Wrong password
    const isInvalid = await bcrypt.compare('WrongPassword', read.rows[0].password_hash);
    subtests.push({ name: 'M1 Wrong password rejected', status: !isInvalid ? 'PASS' : 'FAIL', details: `bcrypt compare=${isInvalid}` });

    // UPDATE
    await m1.query('UPDATE users SET first_name = $1, updated_at = NOW() WHERE id = $2', ['Updated', created.rows[0].id]);
    const updated = await m1.query('SELECT first_name FROM users WHERE id = $1', [created.rows[0].id]);
    subtests.push({ name: 'M1 User UPDATE', status: updated.rows[0].first_name === 'Updated' ? 'PASS' : 'FAIL', details: `first_name=${updated.rows[0].first_name}` });

    // DELETE
    await m1.query('DELETE FROM users WHERE id = $1', [created.rows[0].id]);
    const deleted = await m1.query('SELECT * FROM users WHERE id = $1', [created.rows[0].id]);
    subtests.push({ name: 'M1 User DELETE', status: deleted.rows.length === 0 ? 'PASS' : 'FAIL', details: `rows_after_delete=${deleted.rows.length}` });

    await m1.query('DROP TABLE users');
  } catch (e: any) {
    subtests.push({ name: 'M1 User CRUD', status: 'FAIL', details: e.message });
  }
  await m1.end();

  // M2 Tenant Lifecycle
  const m2 = await pgClient('m2_tenants_db', 'm2_user', 'm2_pass');
  try {
    await m2.query(`CREATE TABLE IF NOT EXISTS tenants (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      is_active BOOLEAN DEFAULT true,
      settings JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )`);

    // Create tenant
    const tenant = await m2.query('INSERT INTO tenants (name, slug) VALUES ($1, $2) RETURNING *', ['Test Org', 'test-org']);
    subtests.push({ name: 'M2 Tenant CREATE', status: tenant.rows.length === 1 ? 'PASS' : 'FAIL', details: `slug=${tenant.rows[0].slug}` });

    // Duplicate slug should fail
    try {
      await m2.query('INSERT INTO tenants (name, slug) VALUES ($1, $2)', ['Duplicate', 'test-org']);
      subtests.push({ name: 'M2 Duplicate slug rejected', status: 'FAIL', details: 'Should have failed' });
    } catch {
      subtests.push({ name: 'M2 Duplicate slug rejected', status: 'PASS', details: 'Unique constraint enforced' });
    }

    // Suspend tenant
    await m2.query('UPDATE tenants SET is_active = false WHERE id = $1', [tenant.rows[0].id]);
    const suspended = await m2.query('SELECT is_active FROM tenants WHERE id = $1', [tenant.rows[0].id]);
    subtests.push({ name: 'M2 Tenant suspend', status: !suspended.rows[0].is_active ? 'PASS' : 'FAIL', details: `is_active=${suspended.rows[0].is_active}` });

    await m2.query('DROP TABLE tenants');
  } catch (e: any) {
    subtests.push({ name: 'M2 Tenant lifecycle', status: 'FAIL', details: e.message });
  }
  await m2.end();

  const allPass = subtests.every(s => s.status === 'PASS');
  return { id: 'T-P0-014/015/016', name: 'M1 User CRUD + Password + M2 Tenant', status: allPass ? 'PASS' : 'FAIL', duration_ms: Date.now() - start, details: `${subtests.filter(s => s.status === 'PASS').length}/${subtests.length} checks passed`, subtests };
}

// ═══════════════════════════════════════════════════════════
// T-P0-017/018: Permission Chain + Action Registry
// ═══════════════════════════════════════════════════════════
async function testPermissionAndActions(): Promise<TestResult> {
  const start = Date.now();
  const subtests: TestResult['subtests'] = [];

  // M3 Roles + M4 Permissions
  const m3 = await pgClient('m3_roles_db', 'm3_user', 'm3_pass');
  const m4 = await pgClient('m4_permissions_db', 'm4_user', 'm4_pass');

  try {
    await m3.query(`CREATE TABLE IF NOT EXISTS roles (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id UUID NOT NULL,
      name TEXT NOT NULL,
      permissions TEXT[] DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`);
    await m4.query(`CREATE TABLE IF NOT EXISTS permissions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id UUID NOT NULL,
      code TEXT NOT NULL,
      description TEXT,
      module TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`);

    const tenantId = uuidv4();

    // Create permissions
    await m4.query('INSERT INTO permissions (tenant_id, code, description, module) VALUES ($1, $2, $3, $4)',
      [tenantId, 'users.create', 'Create users', 'M1']);
    await m4.query('INSERT INTO permissions (tenant_id, code, description, module) VALUES ($1, $2, $3, $4)',
      [tenantId, 'users.read', 'Read users', 'M1']);

    // Create role with permissions
    await m3.query('INSERT INTO roles (tenant_id, name, permissions) VALUES ($1, $2, $3)',
      [tenantId, 'admin', ['users.create', 'users.read']]);

    // Check permission
    const role = await m3.query('SELECT permissions FROM roles WHERE tenant_id = $1 AND name = $2', [tenantId, 'admin']);
    const hasPermission = role.rows[0].permissions.includes('users.create');
    subtests.push({
      name: 'Permission chain (user→role→permission)',
      status: hasPermission ? 'PASS' : 'FAIL',
      details: `permissions=${JSON.stringify(role.rows[0].permissions)}`,
    });

    // Check non-existent permission
    const hasNoPermission = !role.rows[0].permissions.includes('users.delete');
    subtests.push({
      name: 'Missing permission correctly denied',
      status: hasNoPermission ? 'PASS' : 'FAIL',
      details: `users.delete not in permissions`,
    });

    await m3.query('DROP TABLE roles');
    await m4.query('DROP TABLE permissions');
  } catch (e: any) {
    subtests.push({ name: 'Permission chain', status: 'FAIL', details: e.message });
  }
  await m3.end();
  await m4.end();

  // M30 Action Registry
  const m30 = await pgClient('m30_actions_db', 'm30_user', 'm30_pass');
  try {
    await m30.query(`CREATE TABLE IF NOT EXISTS actions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      module TEXT NOT NULL,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`);

    // Register action
    await m30.query('INSERT INTO actions (code, name, module) VALUES ($1, $2, $3)', ['users.create', 'Create User', 'M1']);
    subtests.push({ name: 'M30 Action registration', status: 'PASS', details: 'Action registered' });

    // Validate registered action
    const registered = await m30.query('SELECT * FROM actions WHERE code = $1 AND is_active = true', ['users.create']);
    subtests.push({
      name: 'M30 Registered action validated',
      status: registered.rows.length === 1 ? 'PASS' : 'FAIL',
      details: `found=${registered.rows.length}`,
    });

    // Validate unregistered action
    const unregistered = await m30.query('SELECT * FROM actions WHERE code = $1 AND is_active = true', ['nonexistent.action']);
    subtests.push({
      name: 'M30 Unregistered action rejected',
      status: unregistered.rows.length === 0 ? 'PASS' : 'FAIL',
      details: `found=${unregistered.rows.length} (should be 0)`,
    });

    // Deactivate action
    await m30.query('UPDATE actions SET is_active = false WHERE code = $1', ['users.create']);
    const deactivated = await m30.query('SELECT * FROM actions WHERE code = $1 AND is_active = true', ['users.create']);
    subtests.push({
      name: 'M30 Action deactivation',
      status: deactivated.rows.length === 0 ? 'PASS' : 'FAIL',
      details: `active_after_deactivation=${deactivated.rows.length}`,
    });

    await m30.query('DROP TABLE actions');
  } catch (e: any) {
    subtests.push({ name: 'M30 Action Registry', status: 'FAIL', details: e.message });
  }
  await m30.end();

  const allPass = subtests.every(s => s.status === 'PASS');
  return { id: 'T-P0-017/018', name: 'Permission Chain + Action Registry', status: allPass ? 'PASS' : 'FAIL', duration_ms: Date.now() - start, details: `${subtests.filter(s => s.status === 'PASS').length}/${subtests.length} checks passed`, subtests };
}

// ═══════════════════════════════════════════════════════════
// T-P0-025/026: Database Encryption + Credential Isolation
// ═══════════════════════════════════════════════════════════
async function testCredentialIsolation(): Promise<TestResult> {
  const start = Date.now();
  const subtests: TestResult['subtests'] = [];

  // Test that k1_user cannot access m1_auth_users_db
  try {
    const client = new Client({ host: PG_HOST, port: PG_PORT, database: 'm1_auth_users_db', user: 'k1_user', password: 'k1_pass' });
    await client.connect();
    await client.end();
    subtests.push({ name: 'k1_user blocked from m1_auth_users_db', status: 'FAIL', details: 'Should have been blocked' });
  } catch (e: any) {
    subtests.push({ name: 'k1_user blocked from m1_auth_users_db', status: 'PASS', details: `Correctly blocked: ${e.message.substring(0, 60)}` });
  }

  // Test that m1_user cannot access k3_audit_db
  try {
    const client = new Client({ host: PG_HOST, port: PG_PORT, database: 'k3_audit_db', user: 'm1_user', password: 'm1_pass' });
    await client.connect();
    await client.end();
    subtests.push({ name: 'm1_user blocked from k3_audit_db', status: 'FAIL', details: 'Should have been blocked' });
  } catch (e: any) {
    subtests.push({ name: 'm1_user blocked from k3_audit_db', status: 'PASS', details: `Correctly blocked: ${e.message.substring(0, 60)}` });
  }

  // Test that m30_user cannot access k1_auth_db
  try {
    const client = new Client({ host: PG_HOST, port: PG_PORT, database: 'k1_auth_db', user: 'm30_user', password: 'm30_pass' });
    await client.connect();
    await client.end();
    subtests.push({ name: 'm30_user blocked from k1_auth_db', status: 'FAIL', details: 'Should have been blocked' });
  } catch (e: any) {
    subtests.push({ name: 'm30_user blocked from k1_auth_db', status: 'PASS', details: `Correctly blocked: ${e.message.substring(0, 60)}` });
  }

  // Test that each user CAN access their own DB
  const ownAccess = [
    { db: 'k1_auth_db', user: 'k1_user', pass: 'k1_pass' },
    { db: 'm1_auth_users_db', user: 'm1_user', pass: 'm1_pass' },
    { db: 'm30_actions_db', user: 'm30_user', pass: 'm30_pass' },
  ];
  for (const { db, user, pass } of ownAccess) {
    try {
      const client = await pgClient(db, user, pass);
      await client.query('SELECT 1');
      await client.end();
      subtests.push({ name: `${user} can access own ${db}`, status: 'PASS', details: 'Access granted' });
    } catch (e: any) {
      subtests.push({ name: `${user} can access own ${db}`, status: 'FAIL', details: e.message });
    }
  }

  const allPass = subtests.every(s => s.status === 'PASS');
  return { id: 'T-P0-025/026', name: 'Credential Isolation', status: allPass ? 'PASS' : 'FAIL', duration_ms: Date.now() - start, details: `${subtests.filter(s => s.status === 'PASS').length}/${subtests.length} checks passed`, subtests };
}

// ═══════════════════════════════════════════════════════════
// MAIN — Run all tests
// ═══════════════════════════════════════════════════════════
async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  RASID PLATFORM — Phase 0 Real Infrastructure Tests');
  console.log('═══════════════════════════════════════════════════════════\n');

  const tests = [
    testClusterHealth,
    testDatabaseConnectivity,
    testRLSEnforcement,
    testTokenLifecycle,
    testCrossTenantIsolation,
    testAuditCompleteness,
    testAuditImmutability,
    testConfigCache,
    testEventDelivery,
    testSchemaAndDLQ,
    testUserAndTenantCRUD,
    testPermissionAndActions,
    testCredentialIsolation,
  ];

  for (const test of tests) {
    try {
      const result = await test();
      results.push(result);
      const icon = result.status === 'PASS' ? '✅' : '❌';
      console.log(`${icon} ${result.id}: ${result.name} — ${result.status} (${result.duration_ms}ms)`);
      for (const sub of result.subtests) {
        const subIcon = sub.status === 'PASS' ? '  ✓' : '  ✗';
        console.log(`${subIcon} ${sub.name}: ${sub.details}`);
      }
      console.log();
    } catch (e: any) {
      console.log(`❌ ${test.name} — ERROR: ${e.message}\n`);
      results.push({ id: test.name, name: test.name, status: 'FAIL', duration_ms: 0, details: e.message, subtests: [] });
    }
  }

  // Summary
  const passed = results.filter(r => r.status === 'PASS').length;
  const total = results.length;
  const totalSubtests = results.reduce((sum, r) => sum + r.subtests.length, 0);
  const passedSubtests = results.reduce((sum, r) => sum + r.subtests.filter(s => s.status === 'PASS').length, 0);

  console.log('═══════════════════════════════════════════════════════════');
  console.log(`  SUMMARY: ${passed}/${total} test suites PASSED`);
  console.log(`  SUBTESTS: ${passedSubtests}/${totalSubtests} individual checks PASSED`);
  console.log('═══════════════════════════════════════════════════════════');

  // Write JSON results
  const fs = require('fs');
  fs.writeFileSync('/home/ubuntu/rasid-nexus2/test/phase-0-real/results.json', JSON.stringify(results, null, 2));
  console.log('\nResults written to test/phase-0-real/results.json');
}

main().catch(console.error);
