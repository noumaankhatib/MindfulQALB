/**
 * Test booking flow: past slots hidden for today, booked slots shown
 * Tests on http://localhost:5173/
 */
import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, '../booking-flow-test-screenshots');
const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';

async function main() {
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  const now = new Date();
  const report = {
    currentTime: now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
    currentTimeISO: now.toISOString(),
    todaySlots: [],
    futureDateSlots: [],
    bookedSlots: [],
    consoleErrors: [],
  };

  try {
    console.log('\n--- Step 1: Navigate and open booking modal ---');
    await page.goto(`${BASE_URL}/#get-help`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(500);

    const bookBtn = page.getByRole('button', { name: /book a session/i }).first();
    await bookBtn.scrollIntoViewIfNeeded();
    await bookBtn.click();
    await page.waitForTimeout(700);

    const signInTitle = page.locator('text=Sign in to book a session').first();
    const authRequired = await signInTitle.isVisible().catch(() => false);
    if (authRequired) {
      report.authRequired = true;
      report.error = 'Auth required - sign in to test booking flow';
      console.log('  Auth required - cannot proceed without signing in');
    } else {
      const modal = page.locator('[role="dialog"]').first();
      await modal.waitFor({ state: 'visible', timeout: 5000 }).catch(() => null);

      console.log('\n--- Step 2: Select Individual Therapy ---');
      await page.getByRole('button', { name: /individual therapy/i }).click();
      await page.waitForTimeout(400);

      console.log('\n--- Step 3: Choose Format (Video) ---');
      await page.getByRole('button', { name: /choose format/i }).click();
      await page.waitForTimeout(400);
      await page.getByRole('button', { name: /video call/i }).first().click();
      await page.waitForTimeout(400);

      console.log('\n--- Step 4: Click Select Date & Time ---');
      await page.getByRole('button', { name: /select date & time/i }).click();
      await page.waitForTimeout(600);

      console.log('\n--- Step 5: Select TODAY (first date) ---');
      const dateSection = page.locator('p:has-text("Choose a date")').locator('..');
      const dateButtons = dateSection.locator('button');
      const dateCount = await dateButtons.count();
      if (dateCount > 0) {
        await dateButtons.first().click();
        await page.waitForTimeout(2000);

        const timeSection = page.locator('p:has-text("Available times for")').locator('..');
        const slotButtons = timeSection.locator('button').filter({ hasText: /AM|PM/ });
        const slotCount = await slotButtons.count();
        for (let i = 0; i < slotCount; i++) {
          const text = await slotButtons.nth(i).textContent();
          const m = text.match(/(\d{1,2}:\d{2}\s*[AP]M)/);
          if (m) report.todaySlots.push(m[1]);
        }

        const bookedBtns = timeSection.locator('button:has-text("Booked")');
        const bc = await bookedBtns.count();
        for (let i = 0; i < bc; i++) {
          const text = await bookedBtns.nth(i).textContent();
          const m = text.match(/(\d{1,2}:\d{2}\s*[AP]M)/);
          if (m && !report.bookedSlots.includes(m[1])) report.bookedSlots.push(m[1]);
        }

        await page.screenshot({ path: path.join(OUTPUT_DIR, '01-today-slots.png'), timeout: 5000 }).catch(() => null);
        console.log(`  Current time: ${report.currentTime}`);
        console.log(`  Today slots: ${report.todaySlots.join(', ') || '(none)'}`);
        if (report.bookedSlots.length) console.log(`  Booked: ${report.bookedSlots.join(', ')}`);

        console.log('\n--- Step 6: Select FUTURE date (second date) ---');
        if (dateCount >= 2) {
          await dateButtons.nth(1).click();
          await page.waitForTimeout(2000);

          const futureSlots = timeSection.locator('button').filter({ hasText: /AM|PM/ });
          const fsCount = await futureSlots.count();
          for (let i = 0; i < fsCount; i++) {
            const text = await futureSlots.nth(i).textContent();
            const m = text.match(/(\d{1,2}:\d{2}\s*[AP]M)/);
            if (m) report.futureDateSlots.push(m[1]);
          }

          await page.screenshot({ path: path.join(OUTPUT_DIR, '02-future-date-slots.png'), timeout: 5000 }).catch(() => null);
          console.log(`  Future date slots: ${report.futureDateSlots.join(', ')}`);
        }
      } else {
        report.error = 'No date buttons found';
        console.log('  ERROR: No date buttons');
      }
    }

    report.consoleErrors = consoleErrors;
  } catch (err) {
    report.error = report.error || err.message;
    console.error('Test error:', err.message);
    await page.screenshot({ path: path.join(OUTPUT_DIR, '99-error.png'), timeout: 3000 }).catch(() => null);
  } finally {
    await context.close();
    await browser.close();
  }

  fs.writeFileSync(path.join(OUTPUT_DIR, 'report.json'), JSON.stringify(report, null, 2));
  console.log('\n--- Report ---');
  console.log(JSON.stringify(report, null, 2));
  console.log(`\nScreenshots: ${OUTPUT_DIR}`);
}

main().catch(console.error);
