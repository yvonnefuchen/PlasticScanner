/**
 * End-to-end smoke test for all /api/survey actions.
 * Run this after any schema change or before a major deploy.
 *
 * Usage:
 *   BASE_URL=https://plasticraft.vercel.app \
 *   ADMIN_PASSWORD=<password> \
 *   npx tsx db/smoke-test.ts
 *
 * Against localhost (npx vercel dev):
 *   BASE_URL=http://localhost:3000 ADMIN_PASSWORD=<password> npx tsx db/smoke-test.ts
 */

import { createHmac } from 'crypto';

const BASE_URL = process.env.BASE_URL ?? 'https://plasticraft.vercel.app';
const PASSWORD  = process.env.ADMIN_PASSWORD;

if (!PASSWORD) {
  console.error('ADMIN_PASSWORD env var required');
  process.exit(1);
}

const day = () => new Date().toISOString().slice(0, 10);
const token = createHmac('sha256', PASSWORD).update(day()).digest('hex');

const TEST_ID  = `smoke-test-${Date.now()}`;
const TIMESTAMP = new Date().toISOString();

let passed = 0;
let failed = 0;

async function check(label: string, fn: () => Promise<void>) {
  try {
    await fn();
    console.log(`  ✓  ${label}`);
    passed++;
  } catch (e) {
    console.error(`  ✗  ${label}:`, (e as Error).message);
    failed++;
  }
}

async function post(action: string, payload: Record<string, unknown>) {
  const res = await fetch(`${BASE_URL}/api/survey`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, ...payload }),
  });
  const body = await res.json() as Record<string, unknown>;
  if (!res.ok || body['error']) throw new Error(body['error'] as string ?? `HTTP ${res.status}`);
  return body;
}

async function getAdmin() {
  const res = await fetch(`${BASE_URL}/api/survey`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json() as Record<string, unknown>[];
}

async function login() {
  const res = await fetch(`${BASE_URL}/api/admin-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: PASSWORD }),
  });
  const body = await res.json() as Record<string, unknown>;
  if (!res.ok) throw new Error(body['error'] as string ?? `HTTP ${res.status}`);
  if (!body['token']) throw new Error('No token in response');
}

console.log(`\nSmoke-testing ${BASE_URL} with session ${TEST_ID}\n`);

await check('admin-login returns token', login);

await check('savePre writes session', async () => {
  await post('savePre', {
    id: TEST_ID, timestamp: TIMESTAMP, surveyVersion: 1,
    pre: { q1_sort_habit: 3, q2_seen_marks: 'A', q3_cap_behavior: 'B' },
  });
});

await check('GET /api/survey returns saved session', async () => {
  const sessions = await getAdmin();
  const found = sessions.find(s => s['id'] === TEST_ID);
  if (!found) throw new Error('Session not found in admin list');
  if (found['post'] !== null) throw new Error('post should be null');
});

await check('savePost updates session', async () => {
  await post('savePost', {
    id: TEST_ID,
    post: {
      p1_cap_material: 'B', p2_mix_result: 'B',
      p3_ai_interest: 4, p4_ai_clarity: 5, p5_ai_achievement: 3,
      p6_sort_intention: 4, p7_fun: 5,
    },
  });
});

await check('GET reflects savePost', async () => {
  const sessions = await getAdmin();
  const found = sessions.find(s => s['id'] === TEST_ID);
  if (!found?.['post']) throw new Error('post still null after savePost');
});

await check('deleteSession removes row', async () => {
  await post('deleteSession', { id: TEST_ID });
  const sessions = await getAdmin();
  if (sessions.find(s => s['id'] === TEST_ID)) throw new Error('Session still present after delete');
});

await check('unknown action returns 400', async () => {
  const res = await fetch(`${BASE_URL}/api/survey`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'notAnAction' }),
  });
  if (res.status !== 400) throw new Error(`Expected 400, got ${res.status}`);
});

await check('GET without token returns 401', async () => {
  const res = await fetch(`${BASE_URL}/api/survey`);
  if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
});

console.log(`\n${passed + failed} checks: ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
