/**
 * Phase 0 — Load Test Server
 * A lightweight HTTP server that exercises all kernel and business module operations
 * against real PostgreSQL, Redis, and NATS infrastructure.
 */
import * as http from 'http';
import { Client, Pool } from 'pg';
import Redis from 'ioredis';
import { connect, NatsConnection, StringCodec } from 'nats';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const JWT_SECRET = 'rasid-jwt-secret-phase0-test';
const PORT = 4000;

let redis: Redis;
let nc: NatsConnection;
const pools: Record<string, Pool> = {};
const sc = StringCodec();

// Pre-computed values for speed
const tenantIds = Array.from({ length: 10 }, () => uuidv4());
const passwordHash = bcrypt.hashSync('TestP@ss123!', 10);

function getPool(db: string, user: string, pass: string): Pool {
  if (!pools[db]) {
    pools[db] = new Pool({ host: 'localhost', port: 5432, database: db, user, password: pass, max: 20 });
  }
  return pools[db];
}

async function setupTables() {
  const admin = new Client({ host: 'localhost', port: 5432, database: 'm1_auth_users_db', user: 'rasid_admin', password: 'rasid_admin_pass' });
  await admin.connect();
  await admin.query(`CREATE TABLE IF NOT EXISTS load_test_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    email TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`);
  await admin.query(`GRANT ALL ON load_test_users TO m1_user`);
  await admin.end();

  const k3 = new Client({ host: 'localhost', port: 5432, database: 'k3_audit_db', user: 'k3_user', password: 'k3_pass' });
  await k3.connect();
  await k3.query(`CREATE TABLE IF NOT EXISTS load_test_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    correlation_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`);
  await k3.end();

  const k4 = new Client({ host: 'localhost', port: 5432, database: 'k4_config_db', user: 'k4_user', password: 'k4_pass' });
  await k4.connect();
  await k4.query(`CREATE TABLE IF NOT EXISTS load_test_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    key TEXT NOT NULL,
    value JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`);
  // Pre-populate config
  for (const tid of tenantIds) {
    await k4.query('INSERT INTO load_test_config (tenant_id, key, value) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
      [tid, 'app.theme', JSON.stringify({ color: 'blue' })]);
  }
  await k4.end();

  const k5 = new Client({ host: 'localhost', port: 5432, database: 'k5_events_db', user: 'k5_user', password: 'k5_pass' });
  await k5.connect();
  await k5.query(`CREATE TABLE IF NOT EXISTS load_test_events (
    event_id UUID PRIMARY KEY,
    event_type TEXT NOT NULL,
    tenant_id UUID NOT NULL,
    payload JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`);
  await k5.end();

  const m30 = new Client({ host: 'localhost', port: 5432, database: 'm30_actions_db', user: 'm30_user', password: 'm30_pass' });
  await m30.connect();
  await m30.query(`CREATE TABLE IF NOT EXISTS load_test_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true
  )`);
  await m30.query(`INSERT INTO load_test_actions (code, name) VALUES ('users.create', 'Create User') ON CONFLICT DO NOTHING`);
  await m30.end();

  const m4 = new Client({ host: 'localhost', port: 5432, database: 'm4_permissions_db', user: 'm4_user', password: 'm4_pass' });
  await m4.connect();
  await m4.query(`CREATE TABLE IF NOT EXISTS load_test_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL,
    tenant_id UUID NOT NULL
  )`);
  for (const tid of tenantIds) {
    await m4.query('INSERT INTO load_test_permissions (code, tenant_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      ['users.create', tid]);
  }
  await m4.end();
}

const server = http.createServer(async (req, res) => {
  const url = req.url || '/';
  const tenantId = tenantIds[Math.floor(Math.random() * tenantIds.length)];

  try {
    if (url === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok' }));
      return;
    }

    // ═══ K1: Token Issue + Validate ═══
    if (url === '/k1/token') {
      const issueStart = process.hrtime.bigint();
      const token = jwt.sign({ sub: uuidv4(), tenantId, roles: ['user'] }, JWT_SECRET, { expiresIn: '1h' });
      const issueDuration = Number(process.hrtime.bigint() - issueStart) / 1_000_000;

      const validateStart = process.hrtime.bigint();
      jwt.verify(token, JWT_SECRET);
      const validateDuration = Number(process.hrtime.bigint() - validateStart) / 1_000_000;

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ issue_ms: issueDuration, validate_ms: validateDuration }));
      return;
    }

    // ═══ K2: Tenant Context Overhead ═══
    if (url === '/k2/tenant-context') {
      const pool = getPool('m1_auth_users_db', 'm1_user', 'm1_pass');
      const start = process.hrtime.bigint();
      const client = await pool.connect();
      await client.query(`SET app.current_tenant_id = '${tenantId}'`);
      const duration = Number(process.hrtime.bigint() - start) / 1_000_000;
      client.release();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ overhead_ms: duration }));
      return;
    }

    // ═══ K3: Audit Write ═══
    if (url === '/k3/audit') {
      const pool = getPool('k3_audit_db', 'k3_user', 'k3_pass');
      const start = process.hrtime.bigint();
      await pool.query('INSERT INTO load_test_audit (tenant_id, action, entity_type, correlation_id) VALUES ($1, $2, $3, $4)',
        [tenantId, 'test.action', 'user', uuidv4()]);
      const duration = Number(process.hrtime.bigint() - start) / 1_000_000;
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ write_ms: duration }));
      return;
    }

    // ═══ K4: Config Read (cached + uncached) ═══
    if (url === '/k4/config') {
      const cacheKey = `loadtest:config:${tenantId}:app.theme`;

      // Cached read
      const cachedStart = process.hrtime.bigint();
      let cached = await redis.get(cacheKey);
      const cachedDuration = Number(process.hrtime.bigint() - cachedStart) / 1_000_000;

      // Uncached read (from DB)
      const pool = getPool('k4_config_db', 'k4_user', 'k4_pass');
      const uncachedStart = process.hrtime.bigint();
      const dbRes = await pool.query('SELECT value FROM load_test_config WHERE tenant_id = $1 AND key = $2', [tenantId, 'app.theme']);
      const uncachedDuration = Number(process.hrtime.bigint() - uncachedStart) / 1_000_000;

      // Cache it
      if (dbRes.rows.length > 0 && !cached) {
        await redis.set(cacheKey, JSON.stringify(dbRes.rows[0].value), 'EX', 300);
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ cached_ms: cachedDuration, uncached_ms: uncachedDuration }));
      return;
    }

    // ═══ K5: Event Publish ═══
    if (url === '/k5/event') {
      const publishStart = process.hrtime.bigint();
      nc.publish('rasid.loadtest.event', sc.encode(JSON.stringify({
        event_id: uuidv4(), event_type: 'loadtest.event', tenant_id: tenantId, timestamp: new Date().toISOString()
      })));
      const publishDuration = Number(process.hrtime.bigint() - publishStart) / 1_000_000;

      // Store in DB
      const pool = getPool('k5_events_db', 'k5_user', 'k5_pass');
      const deliveryStart = process.hrtime.bigint();
      await pool.query('INSERT INTO load_test_events (event_id, event_type, tenant_id, payload) VALUES ($1, $2, $3, $4)',
        [uuidv4(), 'loadtest.event', tenantId, JSON.stringify({ test: true })]);
      const deliveryDuration = Number(process.hrtime.bigint() - deliveryStart) / 1_000_000;

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ publish_ms: publishDuration, delivery_ms: deliveryDuration }));
      return;
    }

    // ═══ M4: Permission Check ═══
    if (url === '/m4/permission') {
      const pool = getPool('m4_permissions_db', 'm4_user', 'm4_pass');
      const start = process.hrtime.bigint();
      await pool.query('SELECT * FROM load_test_permissions WHERE code = $1 AND tenant_id = $2', ['users.create', tenantId]);
      const duration = Number(process.hrtime.bigint() - start) / 1_000_000;
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ check_ms: duration }));
      return;
    }

    // ═══ M30: Action Validation ═══
    if (url === '/m30/action') {
      const pool = getPool('m30_actions_db', 'm30_user', 'm30_pass');
      const start = process.hrtime.bigint();
      await pool.query('SELECT * FROM load_test_actions WHERE code = $1 AND is_active = true', ['users.create']);
      const duration = Number(process.hrtime.bigint() - start) / 1_000_000;
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ validation_ms: duration }));
      return;
    }

    // ═══ E2E Flow ═══
    if (url === '/e2e') {
      const e2eStart = process.hrtime.bigint();

      // 1. Issue token
      const token = jwt.sign({ sub: uuidv4(), tenantId, roles: ['admin'] }, JWT_SECRET, { expiresIn: '1h' });
      jwt.verify(token, JWT_SECRET);

      // 2. Set tenant context
      const m1Pool = getPool('m1_auth_users_db', 'm1_user', 'm1_pass');
      const m1Client = await m1Pool.connect();
      await m1Client.query(`SET app.current_tenant_id = '${tenantId}'`);

      // 3. Create user
      await m1Client.query('INSERT INTO load_test_users (tenant_id, email, password_hash) VALUES ($1, $2, $3)',
        [tenantId, `user-${uuidv4().substring(0, 8)}@rasid.sa`, passwordHash]);
      m1Client.release();

      // 4. Audit
      const k3Pool = getPool('k3_audit_db', 'k3_user', 'k3_pass');
      await k3Pool.query('INSERT INTO load_test_audit (tenant_id, action, entity_type, correlation_id) VALUES ($1, $2, $3, $4)',
        [tenantId, 'user.created', 'user', uuidv4()]);

      // 5. Publish event
      nc.publish('rasid.loadtest.e2e', sc.encode(JSON.stringify({ event_type: 'user.created', tenant_id: tenantId })));

      const e2eDuration = Number(process.hrtime.bigint() - e2eStart) / 1_000_000;
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ e2e_ms: e2eDuration }));
      return;
    }

    res.writeHead(404);
    res.end('Not Found');
  } catch (err: any) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: err.message }));
  }
});

async function start() {
  console.log('Setting up infrastructure connections...');
  redis = new Redis({ host: 'localhost', port: 6379, password: 'redis_pass' });
  nc = await connect({ servers: 'nats://localhost:4222' });

  console.log('Setting up test tables...');
  await setupTables();

  server.listen(PORT, () => {
    console.log(`Load test server running on port ${PORT}`);
    console.log('Endpoints: /health, /k1/token, /k2/tenant-context, /k3/audit, /k4/config, /k5/event, /m4/permission, /m30/action, /e2e');
  });
}

start().catch(console.error);
