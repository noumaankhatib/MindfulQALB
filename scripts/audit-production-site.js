/**
 * Audit production site: load time, Cal.com integration, console errors, booking flow
 * Runs against https://www.mindfulqalb.com/
 */
import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, '../production-audit-screenshots');
const SITE_URL = process.env.SITE_URL || 'https://www.mindfulqalb.com/';

async function main() {
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });
  const page = await context.newPage();

  const consoleErrors = [];
  const consoleWarnings = [];
  page.on('console', (msg) => {
    const text = msg.text();
    if (msg.type() === 'error') consoleErrors.push(text);
    else if (msg.type() === 'warning') consoleWarnings.push(text);
  });

  const report = {
    url: SITE_URL,
    timestamp: new Date().toISOString(),
    loadTimeMs: null,
    loadCompleteTimeMs: null,
    calComElements: [],
    bookingElements: [],
    consoleErrors: [],
    consoleWarnings: [],
    screenshots: [],
    navigationSuccess: false,
  };

  try {
    console.log('\n=== Production Site Audit: MindfulQALB ===\n');
    console.log(`Target: ${SITE_URL}\n`);

    // --- 1. Measure page load time ---
    console.log('--- Step 1: Loading main page and measuring load time ---');
    const startNav = Date.now();
    const response = await page.goto(SITE_URL, {
      waitUntil: 'load',
      timeout: 30000,
    }).catch((e) => {
      report.navError = e.message;
      return null;
    });

    if (!response) {
      console.log('  ❌ Navigation failed:', report.navError);
    } else {
      report.navigationSuccess = true;
      report.statusCode = response.status();
      const loadEventEnd = await page.evaluate(() => {
        const perf = performance.getEntriesByType('navigation')[0];
        return perf ? perf.loadEventEnd : null;
      });
      report.loadTimeMs = loadEventEnd ?? Date.now() - startNav;
      report.loadCompleteTimeMs = Date.now() - startNav;
      console.log(`  Status: ${report.statusCode}`);
      console.log(`  Load event: ${report.loadTimeMs?.toFixed(0) ?? 'N/A'} ms`);
      console.log(`  Total (dom ready + network): ~${report.loadCompleteTimeMs} ms`);
    }

    // Wait a bit for dynamic content
    await page.waitForTimeout(2000);

    // --- 2. Look for Cal.com and booking elements ---
    console.log('\n--- Step 2: Searching for Cal.com / booking elements ---');
    const calComInfo = await page.evaluate(() => {
      const results = [];
      // Cal.com embed / iframe
      const iframes = document.querySelectorAll('iframe');
      iframes.forEach((f) => {
        const src = f.src || '';
        if (src.includes('cal.com') || src.includes('calcom')) {
          results.push({ type: 'iframe', src: src.substring(0, 120) });
        }
      });
      // Cal.com links
      const links = document.querySelectorAll('a[href*="cal.com"], a[href*="calcom"]');
      links.forEach((a) => results.push({ type: 'link', href: (a.href || '').substring(0, 120) }));
      // Scripts loading Cal.com
      const scripts = document.querySelectorAll('script[src*="cal.com"], script[src*="calcom"]');
      scripts.forEach((s) => results.push({ type: 'script', src: (s.src || '').substring(0, 120) }));
      // Elements with cal.com in class or data
      const calElements = document.querySelectorAll('[class*="cal"], [data-cal], [id*="cal"]');
      calElements.forEach((el) => {
        const tag = el.tagName.toLowerCase();
        const cls = (el.className || '').toString().substring(0, 80);
        if (cls.includes('cal') || el.id?.includes('cal')) {
          results.push({ type: 'element', tag, className: cls, id: el.id || null });
        }
      });
      return results;
    });
    report.calComElements = calComInfo;
    if (calComInfo.length > 0) {
      console.log(`  Found ${calComInfo.length} Cal.com-related element(s):`);
      calComInfo.forEach((e) => console.log(`    - ${e.type}: ${JSON.stringify(e).slice(0, 100)}...`));
    } else {
      console.log('  No Cal.com embed/iframe/links found (booking is via custom BookingFlow modal, not Cal.com widget)');
    }

    // Booking-related elements
    const bookingInfo = await page.evaluate(() => {
      const results = [];
      const buttons = document.querySelectorAll('button, [role="button"], a');
      buttons.forEach((el) => {
        const text = (el.textContent || '').toLowerCase();
        if (text.includes('book') || text.includes('session') || text.includes('schedule')) {
          results.push({ tag: el.tagName, text: (el.textContent || '').trim().substring(0, 60) });
        }
      });
      return results.slice(0, 15); // limit
    });
    report.bookingElements = bookingInfo;
    console.log(`  Booking-related buttons/links: ${bookingInfo.length} found`);

    // --- 3. Main page screenshot ---
    await page.screenshot({
      path: path.join(OUTPUT_DIR, '01-main-page.png'),
      fullPage: false,
    }).catch(() => null);
    report.screenshots.push('01-main-page.png');
    console.log('  Screenshot: 01-main-page.png');

    // --- 4. Navigate to booking section (#get-help) ---
    console.log('\n--- Step 3: Navigating to booking section (#get-help) ---');
    await page.goto(`${SITE_URL.replace(/\/$/, '')}/#get-help`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(1500);

    await page.screenshot({
      path: path.join(OUTPUT_DIR, '02-booking-section.png'),
      fullPage: false,
    }).catch(() => null);
    report.screenshots.push('02-booking-section.png');
    console.log('  Screenshot: 02-booking-section.png');

    // --- 5. Click "Book a Session" to open modal ---
    console.log('\n--- Step 4: Opening booking modal ---');
    const bookBtn = page.getByRole('button', { name: /book a session/i }).first();
    const bookVisible = await bookBtn.isVisible().catch(() => false);
    if (bookVisible) {
      await bookBtn.scrollIntoViewIfNeeded();
      await bookBtn.click();
      await page.waitForTimeout(1500);

      const modal = page.locator('[role="dialog"]').first();
      const modalVisible = await modal.isVisible().catch(() => false);
      if (modalVisible) {
        await page.screenshot({
          path: path.join(OUTPUT_DIR, '03-booking-modal.png'),
          fullPage: false,
        }).catch(() => null);
        report.screenshots.push('03-booking-modal.png');
        report.bookingModalOpened = true;
        console.log('  Screenshot: 03-booking-modal.png');
      } else {
        report.bookingModalOpened = false;
        console.log('  Modal did not appear (may require auth)');
      }
    } else {
      console.log('  "Book a Session" button not found');
    }

    // --- 6. Console errors ---
    report.consoleErrors = consoleErrors;
    report.consoleWarnings = consoleWarnings;
    console.log('\n--- Step 5: Console errors/warnings ---');
    if (consoleErrors.length > 0) {
      console.log(`  Errors: ${consoleErrors.length}`);
      consoleErrors.forEach((e) => console.log(`    - ${e.substring(0, 120)}`));
    } else {
      console.log('  No console errors');
    }
    if (consoleWarnings.length > 0) {
      console.log(`  Warnings: ${consoleWarnings.length}`);
    }
  } catch (err) {
    report.error = err.message;
    console.error('\nError:', err.message);
  } finally {
    await browser.close();
  }

  // Write report
  const reportPath = path.join(OUTPUT_DIR, 'audit-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
  console.log('\n=== Report saved to:', reportPath);
  console.log('=== Screenshots in:', OUTPUT_DIR);
  return report;
}

main().then((r) => {
  if (r) process.exit(r.error ? 1 : 0);
});
