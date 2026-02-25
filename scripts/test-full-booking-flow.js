/**
 * Full booking flow E2E test - therapy website
 * Navigate to #get-help, click Book a Session, go through all steps.
 * Takes screenshots at each step and generates a detailed report.
 */
import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const OUTPUT_DIR = path.join(__dirname, '../booking-flow-screenshots');
const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';

const report = { steps: [], overall: 'PENDING' };

function log(stepNum, name, status, details = '') {
  const entry = { step: stepNum, name, status, details };
  report.steps.push(entry);
  console.log(`  [${status}] ${name}${details ? ': ' + details : ''}`);
}

async function main() {
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  try {
    // --- Navigate & open modal ---
    await page.goto(`${BASE_URL}/#get-help`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(500);

    const bookBtn = page.getByRole('button', { name: /book a session/i }).first();
    await bookBtn.scrollIntoViewIfNeeded();
    await bookBtn.click();
    await page.waitForTimeout(700);

    const modal = page.locator('[role="dialog"]').first();
    await modal.waitFor({ state: 'visible', timeout: 5000 }).catch(() => null);
    await page.screenshot({ path: path.join(OUTPUT_DIR, '00-modal-opened.png') });

    // Check if auth gate is shown (Supabase configured + not logged in)
    const signInTitle = page.locator('text=Sign in to book a session').first();
    const authRequired = await signInTitle.isVisible().catch(() => false);

    if (authRequired) {
      log(0, 'Open booking modal', 'BLOCKED', 'Auth required: Sign-in modal shown. Cannot test booking flow without signing in.');
      report.overall = 'BLOCKED';
      report.steps.push({ step: 1, name: 'Auth', status: 'BLOCKED', details: 'Supabase is configured. Sign in to access the booking flow.' });
    } else {
      log(0, 'Open booking modal', 'PASS', 'Modal opened with booking flow');
    }

    if (authRequired) {
      await context.close();
      await browser.close();
      fs.writeFileSync(path.join(OUTPUT_DIR, 'report.json'), JSON.stringify(report, null, 2));
      console.log('\n--- Report ---\n' + JSON.stringify(report, null, 2));
      return;
    }

    // --- Step 1: Therapy Type - Individual Therapy ---
    const individualBtn = page.getByRole('button', { name: /individual therapy/i });
    await individualBtn.click();
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(OUTPUT_DIR, '01-therapy-type-selected.png') });

    const chooseFormatBtn = page.getByRole('button', { name: /choose format/i });
    await chooseFormatBtn.click();
    await page.waitForTimeout(500);
    log(1, 'Step 1 - Therapy Type', 'PASS', 'Selected Individual Therapy, clicked Choose Format');

    // --- Step 2: Format - Video Call ---
    const videoBtn = page.getByRole('button', { name: /video call/i }).first();
    await videoBtn.click();
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(OUTPUT_DIR, '02-format-selected.png') });

    const selectDateBtn = page.getByRole('button', { name: /select date & time/i });
    await selectDateBtn.click();
    await page.waitForTimeout(600);
    log(2, 'Step 2 - Format', 'PASS', 'Selected Video Call, clicked Select Date & Time');

    // --- Step 3: Date & Time ---
    await page.getByText('Choose a date:').waitFor({ state: 'visible', timeout: 3000 });
    const dateBtn = page.getByText('Choose a date:').locator('..').locator('button').first();
    await dateBtn.click();
    await page.waitForTimeout(1500);

    const timeSlot = page.locator('button').filter({ hasText: /\d{1,2}:\d{2}\s*(AM|PM)/ }).first();
    await timeSlot.waitFor({ state: 'visible', timeout: 8000 }).catch(() => null);
    await timeSlot.click();
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(OUTPUT_DIR, '03-datetime-slot-selected.png') });

    const confirmSlotBtn = page.getByRole('button', { name: /confirm slot/i });
    await confirmSlotBtn.click();
    await page.waitForTimeout(600);
    log(3, 'Step 3 - Date & Time', 'PASS', 'Selected date, time slot, clicked Confirm Slot');

    // --- Step 4: Consent ---
    const checkbox = page.getByRole('checkbox');
    await checkbox.check();
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(OUTPUT_DIR, '04-consent-accepted.png') });

    const nextBtn = page.getByRole('button', { name: /^next$/i });
    await nextBtn.click();
    await page.waitForTimeout(700);
    log(4, 'Step 4 - Consent', 'PASS', 'Checked consent, clicked Next');

    // --- Step 5: Details (CRITICAL) ---
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(OUTPUT_DIR, '05-details-initial.png') });

    const nameField = page.getByLabel(/full name/i).first();
    const emailField = page.locator('#booking-email');
    const phoneField = page.getByLabel(/phone/i).first();

    const nameValue = await nameField.inputValue();
    const emailVisible = await emailField.isVisible();
    const phoneVisible = await phoneField.isVisible();

    log(5, 'Step 5 - Details (initial load)', 'PASS',
      `Name: ${nameValue ? 'pre-filled' : 'empty'}, Email: ${emailVisible ? 'visible' : 'hidden'}, Phone: ${phoneVisible ? 'yes' : 'no'}`);

    if (!nameValue || nameValue.trim() === '') {
      await nameField.fill('Test User');
    }
    if (emailVisible) {
      await emailField.fill('test@example.com');
    }
    await phoneField.fill('+91 9876543210');
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(OUTPUT_DIR, '06-details-filled.png') });

    const proceedBtn = page.getByRole('button', { name: /proceed to payment/i });
    await proceedBtn.click();
    await page.waitForTimeout(1000);

    const paymentStep = page.locator('text=Complete Payment').first();
    const reachedPayment = await paymentStep.isVisible().catch(() => false);

    if (reachedPayment) {
      log(5, 'Step 5 - Details → Proceed to Payment', 'PASS', 'Button worked, navigated to payment');
    } else {
      const err = await page.locator('[role="alert"], .text-red-500').first().textContent().catch(() => '');
      log(5, 'Step 5 - Details → Proceed to Payment', 'FAIL', err || 'Did not reach payment step');
    }

    // --- Step 6: Payment ---
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(OUTPUT_DIR, '07-payment-step.png') });

    const hasSummary = await page.getByText('Complete Payment').first().isVisible().catch(() => false)
      || await page.getByText('Total Amount').first().isVisible().catch(() => false);

    if (reachedPayment && hasSummary) {
      log(6, 'Step 6 - Payment', 'PASS', 'Payment step shows with booking summary');
    } else {
      log(6, 'Step 6 - Payment', reachedPayment ? 'PARTIAL' : 'FAIL', 'Payment step may be incomplete');
    }

    report.overall = report.steps.some(s => s.status === 'FAIL') ? 'FAIL' : 'PASS';

  } catch (err) {
    console.error('Error:', err.message);
    await page.screenshot({ path: path.join(OUTPUT_DIR, 'error-state.png') });
    report.steps.push({ step: 99, name: 'Error', status: 'FAIL', details: err.message });
    report.overall = 'FAIL';
  } finally {
    await context.close();
    await browser.close();
  }

  // Write report
  const reportPath = path.join(OUTPUT_DIR, 'report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log('\n--- Report ---');
  console.log(JSON.stringify(report, null, 2));
  console.log('\nScreenshots:', OUTPUT_DIR);
}

main().catch(console.error);
