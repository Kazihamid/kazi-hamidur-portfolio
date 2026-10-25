import { spawnSync } from 'node:child_process';
const result = spawnSync(process.execPath, ['node_modules/next/dist/bin/next', 'build'], {
  stdio: 'inherit',
  env: { ...process.env, NEXT_PUBLIC_BASE_PATH: '', NEXT_PUBLIC_CLOUD_CMS: 'true', NEXT_PUBLIC_DEPLOY_VERSION: 'local' },
});
process.exit(result.status ?? 1);
