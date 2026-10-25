import { isPortfolio } from '../src/lib/portfolioValidation.mjs';

const encoder = new TextEncoder();
const cookieName = 'portfolio_session';
const json = (body, status = 200, extra = {}) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...extra } });
const hex = buffer => [...new Uint8Array(buffer)].map(b => b.toString(16).padStart(2, '0')).join('');
async function signature(text, secret) {
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return hex(await crypto.subtle.sign('HMAC', key, encoder.encode(text)));
}
function equal(a, b) {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return mismatch === 0;
}
async function authorized(request, env) {
  if (!env.ADMIN_PASSWORD || env.ADMIN_PASSWORD.length < 16) return false;
  const token = request.headers.get('Cookie')?.split(';').map(s => s.trim()).find(s => s.startsWith(`${cookieName}=`))?.slice(cookieName.length + 1) || '';
  const [expires, mac] = token.split('.');
  return /^\d+$/.test(expires || '') && Number(expires) > Date.now() && Number(expires) <= Date.now() + 9 * 3600000 && equal(mac || '', await signature(expires, env.ADMIN_PASSWORD));
}
async function body(request, maxBytes) {
  if (!request.headers.get('Content-Type')?.startsWith('application/json')) throw new Error('Expected JSON');
  if (Number(request.headers.get('Content-Length')) > maxBytes) throw new Error('Content too large');
  const reader = request.body?.getReader();
  if (!reader) throw new Error('Missing body');
  let size = 0;
  const chunks = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > maxBytes) { await reader.cancel(); throw new Error('Content too large'); }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  return JSON.parse(new TextDecoder().decode(bytes));
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (!url.pathname.startsWith('/api/')) return env.ASSETS.fetch(request);
    if (!['GET', 'POST', 'PUT'].includes(request.method)) return json({ error: 'Method not allowed' }, 405);
    if (request.method !== 'GET' && request.headers.get('Origin') !== url.origin) return json({ error: 'Request origin rejected' }, 403);
    try {
      if (url.pathname === '/api/session' && request.method === 'GET') return json({ authenticated: await authorized(request, env) });
      if (url.pathname === '/api/login' && request.method === 'POST') {
        if (!env.ADMIN_PASSWORD || env.ADMIN_PASSWORD.length < 16) return json({ error: 'Admin password has not been configured.' }, 503);
        const credentials = await body(request, 4096);
        const ip = request.headers.get('CF-Connecting-IP') || 'local';
        const now = Date.now();
        // Atomically count attempts, including failures, across Worker instances.
        const limit = await env.DB.prepare(`INSERT INTO login_attempts (ip, attempts, window_start) VALUES (?, 1, ?)
          ON CONFLICT(ip) DO UPDATE SET attempts = CASE WHEN window_start < ? THEN 1 ELSE attempts + 1 END,
          window_start = CASE WHEN window_start < ? THEN excluded.window_start ELSE window_start END RETURNING attempts`).bind(ip, now, now - 900000, now - 900000).first();
        if (limit.attempts > 10) return json({ error: 'Too many sign-in attempts. Try again in 15 minutes.' }, 429);
        const supplied = typeof credentials?.password === 'string' ? credentials.password : '';
        if (!equal(await signature(supplied, env.ADMIN_PASSWORD), await signature(env.ADMIN_PASSWORD, env.ADMIN_PASSWORD))) return json({ error: 'Incorrect password.' }, 401);
        await env.DB.prepare('DELETE FROM login_attempts WHERE window_start < ?').bind(now - 900000).run();
        const expires = String(now + 8 * 3600000);
        const secure = url.protocol === 'https:' ? '; Secure' : '';
        return json({ authenticated: true }, 200, { 'Set-Cookie': `${cookieName}=${expires}.${await signature(expires, env.ADMIN_PASSWORD)}; HttpOnly; SameSite=Strict; Path=/api; Max-Age=28800${secure}` });
      }
      if (url.pathname === '/api/logout' && request.method === 'POST') return json({ authenticated: false }, 200, { 'Set-Cookie': `${cookieName}=; HttpOnly; SameSite=Strict; Path=/api; Max-Age=0${url.protocol === 'https:' ? '; Secure' : ''}` });
      if (url.pathname === '/api/portfolio' && request.method === 'GET') {
        const row = await env.DB.prepare('SELECT content, revision, updated_at FROM portfolio WHERE id = 1').first();
        return json(row ? { data: JSON.parse(row.content), revision: row.revision, updatedAt: row.updated_at } : { data: null, revision: 0, updatedAt: null });
      }
      if (url.pathname === '/api/portfolio' && request.method === 'PUT') {
        if (!await authorized(request, env)) return json({ error: 'Please sign in before publishing.' }, 401);
        const payload = await body(request, 2000000);
        if (!isPortfolio(payload.data) || !Number.isSafeInteger(payload.revision) || payload.revision < 0) return json({ error: 'Invalid portfolio content.' }, 400);
        const updatedAt = new Date().toISOString();
        const result = payload.revision === 0
          ? await env.DB.prepare('INSERT INTO portfolio (id, content, revision, updated_at) VALUES (1, ?, 1, ?) ON CONFLICT(id) DO NOTHING RETURNING revision').bind(JSON.stringify(payload.data), updatedAt).first()
          : await env.DB.prepare('UPDATE portfolio SET content = ?, revision = revision + 1, updated_at = ? WHERE id = 1 AND revision = ? RETURNING revision').bind(JSON.stringify(payload.data), updatedAt, payload.revision).first();
        if (!result) return json({ error: 'Content changed in another session. Export your edits, reload live content, and merge before publishing.' }, 409);
        return json({ revision: result.revision, updatedAt });
      }
      return json({ error: 'Not found' }, 404);
    } catch (error) {
      if (error instanceof SyntaxError || ['Expected JSON', 'Content too large', 'Missing body'].includes(error.message)) return json({ error: error.message }, 400);
      console.error('Portfolio API request failed', error);
      return json({ error: 'Content service unavailable. Your edits have not been published.' }, 503);
    }
  },
};
