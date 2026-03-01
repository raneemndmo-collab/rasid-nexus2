/**
 * Phase 0 — Load Test (T-P0-020)
 * 100 concurrent connections, 30 minutes, targeting all endpoints
 * Target: p95 < 200ms
 */
import autocannon from 'autocannon';
import * as fs from 'fs';

const BASE_URL = 'http://localhost:4000';
const DURATION_SECONDS = 1800; // 30 minutes
const CONNECTIONS = 100;

const endpoints = [
  '/k1/token',
  '/k2/tenant-context',
  '/k3/audit',
  '/k4/config',
  '/k5/event',
  '/m4/permission',
  '/m30/action',
  '/e2e',
];

async function runLoadTest() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  RASID PLATFORM — Phase 0 Load Test (T-P0-020)');
  console.log(`  Duration: ${DURATION_SECONDS}s (${DURATION_SECONDS / 60} minutes)`);
  console.log(`  Connections: ${CONNECTIONS}`);
  console.log(`  Endpoints: ${endpoints.length}`);
  console.log('═══════════════════════════════════════════════════════════\n');

  let requestIndex = 0;

  const instance = autocannon({
    url: BASE_URL,
    connections: CONNECTIONS,
    duration: DURATION_SECONDS,
    pipelining: 1,
    requests: [
      {
        setupRequest: (req: any) => {
          const endpoint = endpoints[requestIndex % endpoints.length];
          requestIndex++;
          return { ...req, path: endpoint };
        },
      },
    ],
  });

  // Progress reporting every 60 seconds
  let lastReport = Date.now();
  const progressInterval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    console.log(`  [${minutes}m ${seconds}s] Running...`);
  }, 60000);

  const startTime = Date.now();

  autocannon.track(instance, { renderProgressBar: false });

  instance.on('done', (result: any) => {
    clearInterval(progressInterval);
    const elapsed = Math.floor((Date.now() - startTime) / 1000);

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('  LOAD TEST RESULTS');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`  Duration: ${elapsed}s`);
    console.log(`  Total Requests: ${result.requests.total}`);
    console.log(`  Throughput: ${result.requests.average} req/s`);
    console.log(`  Latency p50: ${result.latency.p50}ms`);
    console.log(`  Latency p95: ${result.latency.p95}ms`);
    console.log(`  Latency p99: ${result.latency.p99}ms`);
    console.log(`  Latency avg: ${result.latency.average}ms`);
    console.log(`  Latency max: ${result.latency.max}ms`);
    console.log(`  Errors: ${result.errors}`);
    console.log(`  Timeouts: ${result.timeouts}`);
    console.log(`  Non-2xx: ${result.non2xx}`);
    console.log(`  p95 < 200ms: ${result.latency.p95 < 200 ? '✅ PASS' : '❌ FAIL'}`);
    console.log('═══════════════════════════════════════════════════════════');

    // Write results to file
    const report = {
      test_id: 'T-P0-020',
      test_name: 'Load Test — 100 concurrent, 30 minutes',
      timestamp: new Date().toISOString(),
      duration_seconds: elapsed,
      connections: CONNECTIONS,
      target_duration: DURATION_SECONDS,
      results: {
        total_requests: result.requests.total,
        throughput_avg: result.requests.average,
        latency_p50: result.latency.p50,
        latency_p95: result.latency.p95,
        latency_p99: result.latency.p99,
        latency_avg: result.latency.average,
        latency_max: result.latency.max,
        errors: result.errors,
        timeouts: result.timeouts,
        non_2xx: result.non2xx,
      },
      pass: result.latency.p95 < 200,
    };

    fs.writeFileSync('/home/ubuntu/rasid-nexus2/test/phase-0-real/load-test-results.json', JSON.stringify(report, null, 2));
    console.log('\nResults written to test/phase-0-real/load-test-results.json');
  });
}

runLoadTest().catch(console.error);
