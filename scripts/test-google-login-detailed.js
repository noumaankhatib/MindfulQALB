/**
 * Detailed Google login test - URL, console, network
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

  const consoleErrorsBefore = [];
  const consoleErrorsAfter = [];
  let googleClicked = false;

  const failedRequests = [];
  page.on('requestfailed', (req) => {
    failedRequests.push({
      url: req.url(),
      failure: req.failure()?.errorText || 'unknown',
    });
  });

  page.on('console', (msg) => {
    const text = msg.text();
    if (msg.type() === 'error') {
      if (googleClicked) consoleErrorsAfter.push(text);
      else consoleErrorsBefore.push(text);
    }
  });

  const report = {
    urlBeforeClick: null,
    urlAfterClick: null,
    redirectedToGoogle: false,
    redirectedToSupabase: false,
    stayedOnSamePage: false,
    modalError: null,
    consoleErrorsBefore: [],
    consoleErrorsAfter: [],
    failedRequests: [],
    behavior: null,
  };

  try {
    // 1. Navigate
    console.log('\n--- Step 1: Navigate ---');
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(OUTPUT_DIR, '01-homepage.png'), timeout: 5000 }).catch(() => null);
    report.consoleErrorsBefore = [...consoleErrorsBefore];

    // 2. Click Sign In
    console.log('\n--- Step 2: Click Sign In ---');
    await page.getByRole('button', { name: /sign in/i }).first().scrollIntoViewIfNeeded();
    await page.getByRole('button', { name: /sign in/i }).first().click();
    await page.waitForTimeout(1000);

    const modal = page.locator('[role="dialog"]').first();
    const modalVisible = await modal.isVisible().catch(() => false);
    if (!modalVisible) {
      report.error = 'Auth modal did not open';
      console.log('  ERROR: Modal not visible');
    } else {
      await page.screenshot({ path: path.join(OUTPUT_DIR, '02-auth-modal.png'), timeout: 5000 }).catch(() => null);
      report.consoleErrorsBefore = [...consoleErrorsBefore];
    }

    // 3. Click Continue with Google
    console.log('\n--- Step 3: Click Continue with Google ---');
    report.urlBeforeClick = page.url();

    const googleBtn = page.getByRole('button', { name: /continue with google/i });
    const btnVisible = await googleBtn.isVisible().catch(() => false);
    if (!btnVisible) {
      report.error = 'Continue with Google button not found';
    } else {
      googleClicked = true;
      await googleBtn.click({ noWaitAfter: true });
      await page.waitForTimeout(5000);
    }

    report.urlAfterClick = page.url();
    report.failedRequests = [...failedRequests];
    report.consoleErrorsAfter = [...consoleErrorsAfter];

    report.redirectedToGoogle = report.urlAfterClick.includes('accounts.google.com');
    report.redirectedToSupabase = report.urlAfterClick.includes('supabase.co');
    report.stayedOnSamePage = report.urlBeforeClick === report.urlAfterClick;

    if (report.redirectedToGoogle) {
      report.behavior = 'Redirected to Google OAuth (accounts.google.com)';
      await page.screenshot({ path: path.join(OUTPUT_DIR, '03-google-oauth.png'), timeout: 5000 }).catch(() => null);
    } else if (report.redirectedToSupabase) {
      report.behavior = 'Redirected to supabase.co (may indicate config issue)';
      await page.screenshot({ path: path.join(OUTPUT_DIR, '03-supabase-redirect.png'), timeout: 5000 }).catch(() => null);
    } else if (report.stayedOnSamePage) {
      report.behavior = 'Stayed on same page - no redirect occurred';
      const errEl = page.locator('[role="alert"], [style*="fef2f2"], .bg-red-50').first();
      report.modalError = await errEl.textContent().catch(() => null);
      await page.screenshot({ path: path.join(OUTPUT_DIR, '03-no-redirect.png'), timeout: 5000 }).catch(() => null);
    } else {
      report.behavior = `Redirected to: ${report.urlAfterClick}`;
      await page.screenshot({ path: path.join(OUTPUT_DIR, '03-other.png'), timeout: 5000 }).catch(() => null);
    }
  } catch (err) {
    report.error = err.message;
    console.error('Test error:', err.message);
    await page.screenshot({ path: path.join(OUTPUT_DIR, '99-error.png'), timeout: 3000 }).catch(() => null);
  } finally {
    await context.close();
    await browser.close();
  }

  fs.writeFileSync(path.join(OUTPUT_DIR, 'report.json'), JSON.stringify(report, null, 2));

  console.log('\n========== REPORT ==========');
  console.log('URL before Google click:', report.urlBeforeClick);
  console.log('URL after Google click:', report.urlAfterClick);
  console.log('Behavior:', report.behavior);
  console.log('Redirected to Google?', report.redirectedToGoogle);
  console.log('Redirected to Supabase?', report.redirectedToSupabase);
  console.log('Stayed on same page?', report.stayedOnSamePage);
  if (report.modalError) console.log('Modal error:', report.modalError);
  console.log('Console errors BEFORE click:', report.consoleErrorsBefore.length, report.consoleErrorsBefore);
  console.log('Console errors AFTER click:', report.consoleErrorsAfter.length, report.consoleErrorsAfter);
  console.log('Failed network requests:', report.failedRequests.length, report.failedRequests);
  console.log('\nFull report:', JSON.stringify(report, null, 2));
  console.log('\nScreenshots:', OUTPUT_DIR);
}

main().catch(console.error);
