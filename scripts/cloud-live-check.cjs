const { chromium } = require('playwright');
const { readFileSync, mkdirSync } = require('node:fs');
const assert = require('node:assert/strict');

(async () => {
  const base = new URL(process.argv[2]).origin;
  const password = readFileSync('.env.cloudflare-admin', 'utf8').match(/^ADMIN_PASSWORD=(.+)$/m)?.[1]?.trim();
  const browser = await chromium.launch({ headless: true, ...(process.platform === 'win32' ? { channel: 'msedge' } : {}) });
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`${base}/projects/`);
    await page.getByRole('heading', { name: 'Test Automation Engineering', exact: true }).waitFor();
    await page.goto(`${base}/setup/`);
    await page.getByLabel('Admin password').fill(password);
    await page.getByRole('button', { name: 'Sign in', exact: true }).click();
    await page.getByRole('button', { name: 'Save & Publish', exact: true }).waitFor();
    await page.getByRole('link', { name: 'Import / Export', exact: true }).click();
    await page.getByRole('heading', { name: 'Publish to Live Portfolio', exact: true }).waitFor();
    assert.equal(await page.getByRole('link', { name: '2. Open GitHub Editor', exact: true }).count(), 0);
    mkdirSync('.wrangler/qa', { recursive: true });
    await page.screenshot({ path: '.wrangler/qa/cloudflare-live-setup.png', fullPage: true });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({ path: '.wrangler/qa/cloudflare-live-setup-mobile.png', fullPage: true });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), true, 'Mobile layout must fit the viewport');
    assert.deepEqual(errors, [], 'No browser runtime errors');
    console.log('PASS: live public projects, admin sign-in, cloud publishing controls, mobile layout');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
