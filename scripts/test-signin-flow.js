/**
 * Test email sign-in flow on production site.
 * Captures: error message in modal, auth network request/response.
 */
import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, '../signin-test-output');
const SITE_URL = process.env.SITE_URL || 'https://www.mindfulqalb.com/';

const TEST_EMAIL = 'test@example.com';
const TEST_PASSWORD = 'TestPassword123';

async function main() {
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
  });
  const page = await context.newPage();

  const authRequests = [];
  const consoleLogs = [];
  const consoleErrors = [];

  page.on('console', (msg) => {
    const text = msg.text();
    if (msg.type() === 'error') consoleErrors.push(text);
    consoleLogs.push(`[${msg.type()}] ${text}`);
  });

  // Capture all fetch/XHR responses - especially auth
  page.on('request', (req) => {
    const url = req.url();
    if (url.includes('/auth/') || url.includes('/token') || url.includes('/sb/')) {
      authRequests.push({ type: 'request', url, method: req.method() });
    }
  });

  page.on('response', async (res) => {
    const url = res.url();
    const req = res.request();
    if (!url.includes('/auth/') && !url.includes('/token') && !url.includes('/sb/')) return;

    const status = res.status();
    let bodyText = null;
    let bodyParseError = null;
    try {
      bodyText = await res.text();
    } catch (e) {
      bodyParseError = e.message;
    }

    authRequests.push({
      type: 'response',
      url,
      method: req.method(),
      status,
      headers: res.headers(),
      bodyLength: bodyText?.length ?? 0,
      bodyPreview: bodyText ? bodyText.substring(0, 500) : '(empty)',
      bodyParseError,
      contentType: res.headers()['content-type'] || '',
    });
  });

  const report = {
    url: SITE_URL,
    timestamp: new Date().toISOString(),
    credentials: { email: TEST_EMAIL, password: '***' },
    modalError: null,
    authRequests: [],
    consoleErrors: [],
    jsonErrorFound: false,
  };

  try {
    console.log('\n=== Sign-In Flow Test ===\n');
    console.log(`Target: ${SITE_URL}`);
    console.log(`Credentials: ${TEST_EMAIL} / ***\n`);

    // 1. Navigate
    console.log('--- Step 1: Navigate to site ---');
    await page.goto(SITE_URL, { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForTimeout(1500);

    // 2. Click Sign In
    console.log('--- Step 2: Click Sign In ---');
    const signInBtn = page.getByRole('button', { name: /sign in/i }).or(
      page.locator('a:has-text("Sign In")')
    ).first();
    await signInBtn.scrollIntoViewIfNeeded();
    await signInBtn.click();
    await page.waitForTimeout(800);

    // 3. Check if modal appeared
    const modal = page.locator('[role="dialog"]').first();
    const modalVisible = await modal.isVisible().catch(() => false);
    if (!modalVisible) {
      report.error = 'Auth modal did not appear';
      console.log('  ❌ Auth modal not found');
    } else {
      console.log('  ✓ Auth modal visible');

      // 4. Ensure we're in sign-in mode (not sign-up)
      const signInWithPw = page.locator('input[type="password"]');
      const hasPw = await signInWithPw.isVisible().catch(() => false);
      if (!hasPw) {
        // Maybe need to switch from magic-link - try "Back to sign in with password"
        const backBtn = page.getByRole('button', { name: /back to sign in with password/i });
        if (await backBtn.isVisible().catch(() => false)) {
          await backBtn.click();
          await page.waitForTimeout(300);
        }
      }

      // 5. Fill credentials
      console.log('--- Step 3: Enter credentials ---');
      await page.fill('input[type="email"]', TEST_EMAIL);
      await page.fill('input[type="password"]', TEST_PASSWORD);

      // 6. Click Sign In (submit) - use form submit button inside modal
      console.log('--- Step 4: Click Sign In button ---');
      await modal.locator('button[type="submit"]').click();

      // 7. Wait for response and error/success
      await page.waitForTimeout(4000);

      // 8. Capture error message in modal
      const errorEl = page.locator('[style*="fef2f2"], [style*="dc2626"]').filter({ hasText: /./ });
      const errText = await errorEl.first().textContent().catch(() => null);
      if (errText && errText.trim()) {
        report.modalError = errText.trim();
        console.log('  Modal error:', report.modalError);
      }

      // Also check for AlertCircle error area (red background)
      const errorBox = page.locator('span').filter({ has: page.locator('svg') }).filter({ hasText: /failed|error|invalid/i });
      const errBoxText = await errorBox.first().textContent().catch(() => null);
      if (errBoxText && !report.modalError) {
        report.modalError = errBoxText.trim();
      }

      // Check for JSON parse error in console
      const jsonErr = consoleErrors.find((e) =>
        e.includes("Failed to execute 'json'") || e.includes('Unexpected end of JSON') || e.includes('JSON input')
      );
      if (jsonErr) {
        report.jsonErrorFound = true;
        report.jsonErrorMessage = jsonErr;
        console.log('  JSON parse error in console:', jsonErr.substring(0, 120));
      }
    }

    report.authRequests = authRequests;
    report.consoleErrors = consoleErrors;

    // Summary
    console.log('\n--- Network: Auth-related requests ---');
    const responses = authRequests.filter((r) => r.type === 'response');
    if (responses.length === 0) {
      console.log('  No auth API responses captured (auth may use different URL pattern)');
      // Capture ALL responses that might be auth
      const allResponses = [];
      // Re-run is not possible - we have what we have
    } else {
      responses.forEach((r) => {
        console.log(`  URL: ${r.url}`);
        console.log(`  Status: ${r.status}`);
        console.log(`  Content-Type: ${r.contentType}`);
        console.log(`  Body length: ${r.bodyLength}`);
        console.log(`  Body preview: ${r.bodyPreview?.substring(0, 150)}...`);
        if (r.bodyParseError) console.log(`  Parse error: ${r.bodyParseError}`);
      });
    }

    // Screenshot
    await page.screenshot({
      path: path.join(OUTPUT_DIR, 'signin-result.png'),
      fullPage: false,
    });
    report.screenshot = 'signin-result.png';
  } catch (err) {
    report.error = err.message;
    report.stack = err.stack;
    console.error('\nError:', err.message);
  } finally {
    await browser.close();
  }

  const reportPath = path.join(OUTPUT_DIR, 'signin-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
  console.log('\n=== Report saved:', reportPath);
  return report;
}

main().then((r) => {
  if (r) process.exit(r.error ? 1 : 0);
});
