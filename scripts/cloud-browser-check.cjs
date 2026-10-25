const assert = require('node:assert/strict');
const { chromium } = require('playwright');

(async () => {
  const base = process.env.CLOUD_TEST_URL || 'http://localhost:8787';
  if (!['localhost', '127.0.0.1'].includes(new URL(base).hostname)) throw new Error('This test publishes temporary content; only local URLs are permitted.');
  const browser = await chromium.launch({ headless: true, ...(process.platform === 'win32' ? { channel: 'msedge' } : {}) });
  const context = await browser.newContext();
  const page = await context.newPage();
  const failures = [];
  page.on('pageerror', error => failures.push(error.message));
  let original;
  try {
    await page.goto(`${base}/setup/projects/`);
    await page.getByLabel('Admin password').fill(process.env.CLOUD_TEST_PASSWORD || 'local-test-password-123456');
    await page.getByRole('button', { name: 'Sign in', exact: true }).click();
    await page.getByRole('button', { name: 'Save & Publish', exact: true }).waitFor();
    const live = await (await page.request.get(`${base}/api/portfolio`)).json();
    original = live.data || require('../src/data/portfolio.json');
    const textarea = page.locator('textarea').first();
    await textarea.waitFor();
    const marker = `Browser publication check ${Date.now()}`;
    await textarea.fill(marker);
    await page.getByRole('button', { name: 'Save & Publish', exact: true }).click();
    await page.getByText('Published. Your live portfolio is updated.', { exact: true }).waitFor();
    const visitor = await browser.newPage();
    await visitor.goto(`${base}/projects/`);
    await visitor.getByText(marker, { exact: true }).waitFor();
    await visitor.close();
    await textarea.fill(`${marker} unsaved`);
    await page.getByRole('link', { name: 'View Portfolio', exact: true }).click();
    await page.waitForURL(`${base}/`);
    await page.goBack();
    await textarea.waitFor();
    assert.equal(await textarea.inputValue(), `${marker} unsaved`, 'Unsaved draft survives client navigation');
    await page.getByRole('button', { name: 'Save Draft', exact: true }).click();
    await page.reload();
    await page.getByRole('button', { name: 'Save & Publish', exact: true }).waitFor();
    assert.equal(await textarea.inputValue(), `${marker} unsaved`, 'Browser backup restores on reload');
    assert.deepEqual(failures, [], 'No browser runtime errors');
    console.log('PASS: sign-in, publish, anonymous public content, draft navigation, backup restore');
  } finally {
    if (original) {
      const current = await (await page.request.get(`${base}/api/portfolio`)).json();
      const response = await page.request.put(`${base}/api/portfolio`, { headers: { Origin: base }, data: { data: original, revision: current.revision } });
      assert.equal(response.status(), 200, 'Restore original local test content');
    }
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
