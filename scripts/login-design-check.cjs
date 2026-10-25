const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const { mkdirSync } = require('node:fs');

(async () => {
  const base = process.env.CLOUD_TEST_URL || 'http://localhost:8790';
  assert.ok(['localhost', '127.0.0.1'].includes(new URL(base).hostname), 'Use a local test server');
  const browser = await chromium.launch({ headless: true, ...(process.platform === 'win32' ? { channel: 'msedge' } : {}) });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`${base}/setup/`);
    const submit = page.getByRole('button', { name: 'Sign in', exact: true });
    await submit.waitFor();
    await page.waitForFunction(() => !document.querySelector('.login-submit').disabled);
    mkdirSync('.wrangler/qa', { recursive: true });
    for (const width of [1440, 768, 390, 320]) {
      await page.setViewportSize({ width, height: width < 700 ? 844 : 1000 });
      await page.screenshot({ path: `.wrangler/qa/login-redesign-${width}.png`, fullPage: true, animations: 'disabled' });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `No overflow at ${width}px`);
    }
    await page.emulateMedia({ reducedMotion: 'reduce' });
    assert.equal(await page.locator('.login-frame').evaluate(el => getComputedStyle(el).animationName), 'none');
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    const input = page.getByLabel('Admin password', { exact: true });
    await submit.click();
    await page.getByText('Enter your admin password.', { exact: true }).waitFor();
    assert.equal(await input.getAttribute('aria-invalid'), 'true');
    assert.equal(await input.evaluate(el => el === document.activeElement), true);
    await input.fill('a-wrong-password');
    await page.getByRole('button', { name: 'Show password', exact: true }).click();
    assert.equal(await input.getAttribute('type'), 'text');
    assert.equal(await input.inputValue(), 'a-wrong-password');
    await page.getByRole('button', { name: 'Hide password', exact: true }).click();
    assert.equal(await input.getAttribute('type'), 'password');
    await page.setViewportSize({ width: 1440, height: 1000 });
    const before = await submit.boundingBox();
    await submit.click();
    await page.getByText('Incorrect password.', { exact: true }).waitFor();
    const after = await submit.boundingBox();
    assert.ok(Math.abs(after.y - before.y) < 1, 'Field error does not move the primary button');
    await input.fill(process.env.CLOUD_TEST_PASSWORD || 'local-test-password-123456');
    await input.press('Tab');
    assert.equal(await page.getByRole('button', { name: 'Show password', exact: true }).evaluate(el => el === document.activeElement), true);
    await input.focus();
    // Delay the real API response just enough to inspect the loading state.
    await page.route('**/api/login', async route => { const response = await route.fetch(); await new Promise(resolve => setTimeout(resolve, 800)); await route.fulfill({ response }); });
    await input.press('Enter');
    await page.getByRole('button', { name: 'Signing in…', exact: true }).waitFor();
    assert.equal(await page.getByRole('button', { name: 'Signing in…', exact: true }).isDisabled(), true);
    await page.getByRole('button', { name: 'Save & Publish', exact: true }).waitFor();
    assert.deepEqual(errors, []);
    console.log('PASS: responsive layout, reduced motion, blank/incorrect passwords, stable inline errors, visibility toggle, keyboard submission, loading state, authenticated sign-in');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
