import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';

const cli = 'node_modules/wrangler/bin/wrangler.js';
function wrangler(args, { capture = false, input } = {}) {
  const result = spawnSync(process.execPath, [cli, ...args], {
    encoding: 'utf8', input,
    stdio: capture || input !== undefined ? ['pipe', 'pipe', 'pipe'] : 'inherit',
    env: { ...process.env, WRANGLER_SEND_METRICS: 'false' },
  });
  if (result.status !== 0) {
    if (capture || input !== undefined) process.stderr.write((result.stderr || '') + (result.stdout || ''));
    throw new Error(`Cloudflare command failed: ${args.slice(0, 2).join(' ')}`);
  }
  return result.stdout || '';
}

const config = JSON.parse(readFileSync('wrangler.jsonc', 'utf8'));
const binding = config.d1_databases.find(item => item.binding === 'DB');
if (binding.database_id === '00000000-0000-0000-0000-000000000000') {
  let databases = JSON.parse(wrangler(['d1', 'list', '--json'], { capture: true }));
  if (!databases.some(item => item.name === binding.database_name)) {
    wrangler(['d1', 'create', binding.database_name, '--location', 'apac', '--update-config=false']);
    databases = JSON.parse(wrangler(['d1', 'list', '--json'], { capture: true }));
  }
  const database = databases.find(item => item.name === binding.database_name);
  if (!database?.uuid) throw new Error('Cloudflare did not return a database UUID.');
  binding.database_id = database.uuid;
  writeFileSync('wrangler.jsonc', JSON.stringify(config, null, 2) + '\n');
}
wrangler(['d1', 'migrations', 'apply', 'DB', '--remote']);
const secretFile = '.env.cloudflare-admin';
if (!existsSync(secretFile)) writeFileSync(secretFile, `ADMIN_PASSWORD=${randomBytes(32).toString('base64url')}\n`, { mode: 0o600 });
const password = readFileSync(secretFile, 'utf8').match(/^ADMIN_PASSWORD=(.+)$/m)?.[1]?.trim();
if (!password || password.length < 16) throw new Error('The local admin password file is invalid.');
wrangler(['secret', 'put', 'ADMIN_PASSWORD'], { input: password + '\n' });
console.log('Database schema and admin password configured. The password is in .env.cloudflare-admin (git-ignored).');
console.log('Run npm run cloud:deploy to publish the verified application.');
