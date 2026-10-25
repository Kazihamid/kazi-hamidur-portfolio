import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const url = new URL(process.argv[2]);
if (url.protocol !== 'https:') throw new Error('Use the HTTPS URL printed by Wrangler.');
const password = readFileSync('.env.cloudflare-admin', 'utf8').match(/^ADMIN_PASSWORD=(.+)$/m)?.[1]?.trim();
const login = await fetch(new URL('/api/login', url), { method: 'POST', headers: { Origin: url.origin, 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) });
assert.equal(login.status, 200, 'Production admin sign-in must succeed');
const cookie = login.headers.get('Set-Cookie')?.split(';')[0];
assert.ok(cookie, 'Production sign-in must set a session cookie');
let live = await (await fetch(new URL('/api/portfolio', url))).json();
if (!live.data) {
  const data = JSON.parse(readFileSync('src/data/portfolio.json', 'utf8'));
  const saved = await fetch(new URL('/api/portfolio', url), {
    method: 'PUT', headers: { Origin: url.origin, 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({ data, revision: 0 }),
  });
  assert.equal(saved.status, 200, `Initial production content must save: ${await saved.text()}`);
  live = await (await fetch(new URL('/api/portfolio', url))).json();
  assert.deepEqual(live.data, data, 'Anonymous visitors must receive the exact published JSON');
  console.log('Initial portfolio content published and verified.');
} else console.log('Existing published content preserved.');
const blocked = await fetch(new URL('/api/portfolio', url), {
  method: 'PUT', headers: { Origin: url.origin, 'Content-Type': 'application/json' },
  body: JSON.stringify({ data: live.data, revision: live.revision }),
});
assert.equal(blocked.status, 401, 'Anonymous production publishing must be blocked');
console.log(`PASS: production sign-in, persistent public content, and anonymous write protection at ${url.origin}`);
