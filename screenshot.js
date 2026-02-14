import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  
  await page.goto('http://localhost:3004/', { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'screenshot-homepage.png' });
  
  // Scroll to Book Your Session section
  const bookSection = await page.locator('text=Book Your Session').first();
  await bookSection.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'screenshot-book-section.png' });
  
  await browser.close();
  console.log('Screenshots saved: screenshot-homepage.png, screenshot-book-section.png');
})();
