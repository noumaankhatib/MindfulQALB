/**
 * Test Google sign-in flow on localhost:5173
 * Reports: popup appearance, modal errors, origin_mismatch, nonce, or success
 */
import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, '../google-signin-test-output');
const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';

async function main() {
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const browser = await chromium.launch({
    headless: true,
    args: ['--disable-blink-features=AutomationControlled', '--disable-popup-blocking'],
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    ignoreHTTPSErrors: true,
  });

  const page = await context.newPage();

  const consoleLogs = [];
  const consoleErrors = [];
  page.on('console', (msg) => {
    const text = msg.text();
    if (msg.type() === 'error') consoleErrors.push(text);
    consoleLogs.push(`[${msg.type()}] ${text}`);
  });

  const report = {
    url: BASE_URL,
    timestamp: new Date().toISOString(),
    popupAppeared: false,
    popupUrl: null,
    popupContent: null,
    modalError: null,
    originMismatch: false,
    nonceError: false,
    googleLoginPageVisible: false,
    finalState: 'unknown',
    consoleErrors: [],
  };

  try {
    console.log('\n=== Google Sign-In Flow Test (localhost) ===\n');
    console.log(`Target: ${BASE_URL}\n`);

    // 1. Navigate
    console.log('--- Step 1: Navigate ---');
    await page.goto(BASE_URL + '/', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(3000);
    console.log('  Loaded, waited 3s');

    // 2. Click Sign In
    console.log('\n--- Step 2: Click Sign In ---');
    const signInBtn = page.getByRole('button', { name: /sign in/i }).first();
    await signInBtn.scrollIntoViewIfNeeded();
    await signInBtn.click({ force: true }); // force to bypass any overlay (dropdown, etc.)
    await page.waitForTimeout(800);

    const modal = page.locator('[role="dialog"]').first();
    const modalVisible = await modal.isVisible().catch(() => false);
    if (!modalVisible) {
      report.finalState = 'Modal did not appear';
      console.log('  ❌ Modal not found');
    } else {
      const title = await modal.locator('h2').first().textContent().catch(() => '');
      console.log('  Modal title:', title.trim());
      if (!title?.includes('Welcome Back')) {
        report.finalState = `Modal showed "${title}" instead of Welcome Back`;
      }

      // 3. Click "Continue with Google" and capture popup
      console.log('\n--- Step 3: Click Continue with Google ---');
      const [popup] = await Promise.all([
        context.waitForEvent('page', { timeout: 8000 }).catch(() => null),
        modal.getByRole('button', { name: /continue with google/i }).click(),
      ]);

      await page.waitForTimeout(5000);

      if (popup) {
        report.popupAppeared = true;
        report.popupUrl = popup.url();
        console.log('  ✓ Popup appeared');
        console.log('  Popup URL:', report.popupUrl);

        try {
          const popupTitle = await popup.title();
          const popupContent = await popup.content().catch(() => '');
          report.popupContent = popupContent.substring(0, 2000);

          if (report.popupUrl.includes('accounts.google.com')) {
            report.googleLoginPageVisible = true;
            report.finalState = 'Google login page opened in popup';
            console.log('  → Google login page visible');
          } else if (popupContent.includes('origin_mismatch') || report.popupUrl.includes('origin_mismatch')) {
            report.originMismatch = true;
            report.finalState = 'origin_mismatch error';
            console.log('  ❌ origin_mismatch detected');
          } else if (popupContent.includes('nonce') || popupContent.includes('Nonce')) {
            report.nonceError = true;
            report.finalState = 'nonce error';
            console.log('  ❌ nonce error detected');
          } else {
            report.finalState = `Popup at ${report.popupUrl} - content: ${popupContent.substring(0, 200)}`;
          }

          await popup.screenshot({ path: path.join(OUTPUT_DIR, 'popup.png') }).catch(() => null);
        } catch (e) {
          report.popupContent = `Error reading popup: ${e.message}`;
        }
      } else {
        report.popupAppeared = false;
        console.log('  No popup appeared within 8s');
        report.finalState = 'No popup appeared';
      }

      // 4. Check for error in main page modal
      const errorEl = page.locator('[style*="fef2f2"], [style*="dc2626"], [style*="fecaca"]').filter({ hasText: /./ });
      const errText = await errorEl.first().textContent().catch(() => null);
      if (errText && errText.trim()) {
        report.modalError = errText.trim();
        console.log('  Modal error:', report.modalError);
      }

      // Also check for "Google sign-in failed" or generic error
      const anyError = await modal.locator('span').filter({ hasText: /failed|error|origin|nonce|mismatch/i }).first().textContent().catch(() => null);
      if (anyError && !report.modalError) {
        report.modalError = anyError.trim();
      }

      if (consoleErrors.some((e) => e.includes('origin_mismatch') || e.includes('origin'))) {
        report.originMismatch = true;
      }
      if (consoleErrors.some((e) => e.toLowerCase().includes('nonce'))) {
        report.nonceError = true;
      }
    }

    report.consoleErrors = consoleErrors;

    // Screenshot of main page
    await page.screenshot({ path: path.join(OUTPUT_DIR, 'main-page-final.png') });
    report.screenshot = 'main-page-final.png';

    console.log('\n--- Summary ---');
    console.log('  Popup appeared:', report.popupAppeared);
    console.log('  Google login page:', report.googleLoginPageVisible);
    console.log('  Modal error:', report.modalError || '(none)');
    console.log('  origin_mismatch:', report.originMismatch);
    console.log('  nonce error:', report.nonceError);
    console.log('  Final state:', report.finalState);
  } catch (err) {
    report.error = err.message;
    report.stack = err.stack;
    console.error('\nError:', err.message);
    try {
      await page.screenshot({ path: path.join(OUTPUT_DIR, 'main-page-error.png') });
    } catch (_) {}
  } finally {
    await browser.close();
  }

  const reportPath = path.join(OUTPUT_DIR, 'google-signin-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
  console.log('\n=== Report saved:', reportPath);
  return report;
}

main().then((r) => process.exit(r?.error ? 1 : 0));
