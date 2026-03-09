/**
 * Test Google login flow on production site
 * 1. Navigate to site
 * 2. Click Sign In
 * 3. Click "Continue with Google"
 * 4. Check redirect to accounts.google.com
 * 5. Capture console errors
 * 6. Take screenshots at each step
 */
import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, '../google-login-test-screenshots');
const BASE_URL = process.env.BASE_URL || 'https://mindfulqalb.vercel.app/';

async function main() {
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    ignoreHTTPSErrors: true,
  });
  const page = await context.newPage();

  const consoleLogs = [];
  const consoleErrors = [];

  page.on('console', (msg) => {
    const text = msg.text();
    const type = msg.type();
    if (type === 'error') consoleErrors.push(text);
    consoleLogs.push(`[${type}] ${text}`);
  });

  const report = {
    steps: [],
    finalUrl: null,
    redirectedToGoogle: false,
    consoleErrors,
    screenshots: [],
  };

  try {
    // Step 1: Navigate to site
    console.log('\n--- Step 1: Navigating to site ---');
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(OUTPUT_DIR, '01-homepage.png') });
    report.steps.push({ step: 1, name: 'Load homepage', url: page.url(), status: 'OK' });
    console.log('  Screenshot: 01-homepage.png');

    // Step 2: Find and click Sign In button
    console.log('\n--- Step 2: Clicking Sign In ---');
    const signInBtn = page.getByRole('button', { name: /sign in/i }).first();
    await signInBtn.scrollIntoViewIfNeeded();
    await signInBtn.click();
    await page.waitForTimeout(1000);

    const modal = page.locator('[role="dialog"]').first();
    const modalVisible = await modal.isVisible().catch(() => false);
    if (!modalVisible) {
      report.steps.push({ step: 2, name: 'Open Sign In modal', status: 'FAIL', details: 'Modal not visible' });
      console.log('  ERROR: Sign-in modal did not appear');
    } else {
      await page.screenshot({ path: path.join(OUTPUT_DIR, '02-auth-modal.png') });
      report.steps.push({ step: 2, name: 'Open Sign In modal', status: 'OK' });
      console.log('  Screenshot: 02-auth-modal.png');
    }

    // Step 3: Click "Continue with Google" (triggers redirect - don't wait for navigation)
    console.log('\n--- Step 3: Clicking Continue with Google ---');
    const googleBtn = page.getByRole('button', { name: /continue with google/i });
    const googleBtnVisible = await googleBtn.isVisible().catch(() => false);
    if (!googleBtnVisible) {
      report.steps.push({ step: 3, name: 'Click Continue with Google', status: 'FAIL', details: 'Button not found' });
      console.log('  ERROR: "Continue with Google" button not found');
    } else {
      report.steps.push({ step: 3, name: 'Click Continue with Google', status: 'OK' });
      await googleBtn.click({ noWaitAfter: true });
      await page.waitForURL(/accounts\.google\.com/, { timeout: 8000 }).catch(() => null);
      await page.waitForTimeout(2000);
    }

    // Check for error message in modal (if we didn't redirect)
    const errorEl = page.locator('[role="alert"], .text-red-700, .bg-red-50').first();
    const errorText = await errorEl.textContent().catch(() => null);
    if (errorText && !report.redirectedToGoogle) {
      report.modalError = errorText.trim();
      console.log('  Modal error text:', errorText.trim());
    }

    // Step 4: Check if redirected to Google OAuth
    const finalUrl = page.url();
    report.finalUrl = finalUrl;
    report.redirectedToGoogle = finalUrl.includes('accounts.google.com');

    if (report.redirectedToGoogle) {
      await page.screenshot({ path: path.join(OUTPUT_DIR, '03-google-oauth.png'), timeout: 5000 }).catch(() => null);
      report.steps.push({ step: 4, name: 'Redirect to Google OAuth', status: 'PASS', url: finalUrl });
      console.log('  SUCCESS: Redirected to accounts.google.com');
      console.log('  Screenshot: 03-google-oauth.png');
    } else {
      await page.screenshot({ path: path.join(OUTPUT_DIR, '03-after-google-click.png'), timeout: 5000 }).catch(() => null);
      report.steps.push({
        step: 4,
        name: 'Redirect to Google OAuth',
        status: 'FAIL',
        details: `Expected redirect to accounts.google.com, got: ${finalUrl}`,
        url: finalUrl,
      });
      console.log('  FAIL: Did NOT redirect to accounts.google.com');
      console.log(`  Current URL: ${finalUrl}`);
      console.log('  Screenshot: 03-after-google-click.png');
    }

    // Step 5: Report console errors
    console.log('\n--- Console Errors ---');
    if (consoleErrors.length === 0) {
      console.log('  No console errors recorded.');
      report.steps.push({ step: 5, name: 'Console', status: 'OK', details: 'No errors' });
    } else {
      consoleErrors.forEach((err, i) => console.log(`  [${i + 1}] ${err}`));
      report.steps.push({ step: 5, name: 'Console', status: 'HAS_ERRORS', count: consoleErrors.length, errors: consoleErrors });
    }
  } catch (err) {
    console.error('Test error:', err.message);
    report.steps.push({ error: err.message });
    await page.screenshot({ path: path.join(OUTPUT_DIR, '99-error.png') });
  } finally {
    await context.close();
    await browser.close();
  }

  // Write report
  fs.writeFileSync(path.join(OUTPUT_DIR, 'report.json'), JSON.stringify(report, null, 2));
  console.log('\n--- Report ---');
  console.log(JSON.stringify(report, null, 2));
  console.log(`\nScreenshots saved to: ${OUTPUT_DIR}`);
}

main().catch(console.error);
