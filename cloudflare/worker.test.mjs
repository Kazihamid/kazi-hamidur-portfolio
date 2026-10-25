import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Miniflare, convertV4MiniflareOptions } from 'miniflare';
import { isPortfolio } from '../src/lib/portfolioValidation.mjs';

const password = 'local-test-password-123456';
const fixture = JSON.parse(readFileSync(new URL('../src/data/portfolio.json', import.meta.url), 'utf8'));
let mf;
before(async () => {
  mf = new Miniflare(convertV4MiniflareOptions({ modules: [
    { type: 'ESModule', path: 'cloudflare/worker.mjs' },
    { type: 'ESModule', path: 'src/lib/portfolioValidation.mjs' },
  ], modulesRoot: '.', compatibilityDate: '2026-10-25', d1Databases: ['DB'], bindings: { ADMIN_PASSWORD: password } }));
  const db = await mf.getD1Database('DB');
  for (const sql of readFileSync(new URL('./migrations/0001_content.sql', import.meta.url), 'utf8').split(';').filter(s => s.trim())) await db.prepare(sql).run();
});
after(async () => { await mf?.dispose(); });
const request = (path, method = 'GET', data, cookie, origin = 'https://portfolio.test', ip = '127.0.0.1') => mf.dispatchFetch(`https://portfolio.test/api/${path}`, {
  method, headers: { Origin: origin, 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}), 'CF-Connecting-IP': ip },
  body: data === undefined ? undefined : JSON.stringify(data),
});

test('validation rejects broken nested data and executable navigation', () => {
  assert.equal(isPortfolio(fixture), true);
  const broken = structuredClone(fixture); broken.projects[0].tools = [3];
  assert.equal(isPortfolio(broken), false);
  const unsafe = structuredClone(fixture); unsafe.navigation[0].href = 'javascript:alert(1)';
  assert.equal(isPortfolio(unsafe), false);
});

test('anonymous users can read, but cannot publish', async () => {
  assert.equal((await request('portfolio', 'PUT', { data: fixture, revision: 0 })).status, 401);
  const live = await (await request('portfolio')).json();
  assert.equal(live.revision, 0); assert.equal(live.data, null);
});

test('login rejects wrong passwords, foreign origins, and throttles repeated attempts', async () => {
  assert.equal((await request('login', 'POST', { password }, undefined, 'https://evil.test')).status, 403);
  for (let i = 0; i < 10; i++) assert.equal((await request('login', 'POST', { password: 'wrong' }, undefined, undefined, '1.2.3.4')).status, 401);
  assert.equal((await request('login', 'POST', { password }, undefined, undefined, '1.2.3.4')).status, 429);
});

test('admin can publish and read exact content; stale clients cannot overwrite it', async () => {
  const signedIn = await request('login', 'POST', { password });
  assert.equal(signedIn.status, 200);
  const cookie = signedIn.headers.get('Set-Cookie').split(';')[0];
  assert.match(signedIn.headers.get('Set-Cookie'), /HttpOnly.*SameSite=Strict.*Secure/);
  assert.equal((await (await request('session', 'GET', undefined, cookie)).json()).authenticated, true);
  const content = structuredClone(fixture); content.projects[0].description = 'A newly published description';
  const saved = await request('portfolio', 'PUT', { data: content, revision: 0 }, cookie);
  assert.equal(saved.status, 200); assert.equal((await saved.json()).revision, 1);
  assert.deepEqual((await (await request('portfolio')).json()).data, content);
  assert.equal((await request('portfolio', 'PUT', { data: fixture, revision: 0 }, cookie)).status, 409);
  content.projects[0].description = 'Second update';
  assert.equal((await request('portfolio', 'PUT', { data: content, revision: 1 }, cookie)).status, 200);
  assert.equal((await (await request('portfolio')).json()).revision, 2);
  assert.equal((await request('portfolio', 'PUT', { data: {}, revision: 2 }, cookie)).status, 400);
  assert.equal((await request('portfolio', 'PUT', { data: fixture, revision: 2 }, cookie, 'https://evil.test')).status, 403);
  assert.equal((await request('session', 'GET', undefined, `${cookie}bad`)).status, 200);
  assert.equal((await (await request('session', 'GET', undefined, `${cookie}bad`)).json()).authenticated, false);
  const logout = await request('logout', 'POST', {}, cookie);
  assert.match(logout.headers.get('Set-Cookie'), /Max-Age=0/);
});
