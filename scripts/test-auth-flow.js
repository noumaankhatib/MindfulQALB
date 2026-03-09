/**
 * Test full authentication flow on production:
 * Sign up, Sign in, Sign out
 */
import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, '../auth-flow-test-screenshots');
const BASE_URL = process.env.BASE_URL || 'https://mindfulqalb.vercel.app';

const SIGNUP = {
  fullName: 'Test User Flow',
  email: 'testflow2026@mailinator.com',
  password: 'TestPass123!',
};

async function main() {
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  const report = { steps: [], signUpSuccess: null, signInSuccess: null, signOutSuccess: null, consoleErrors: [] };

  try {
    // 1. Navigate
    console.log('\n--- Step 1: Navigate to site ---');
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 25000 });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(OUTPUT_DIR, '01-homepage.png'), timeout: 5000 }).catch(() => null);
    report.steps.push({ step: 1, name: 'Navigate', status: 'OK' });

    // 2. Click Sign In
    console.log('\n--- Step 2: Click Sign In ---');
    const signInBtn = page.getByRole('button', { name: /sign in/i }).first();
    await signInBtn.scrollIntoViewIfNeeded();
    await signInBtn.click();
    await page.waitForTimeout(800);

    const modal = page.locator('[role="dialog"]').first();
    const modalVisible = await modal.isVisible().catch(() => false);
    if (!modalVisible) {
      report.steps.push({ step: 2, name: 'Open auth modal', status: 'FAIL', details: 'Modal not visible' });
    } else {
      await page.screenshot({ path: path.join(OUTPUT_DIR, '02-auth-modal.png'), timeout: 5000 }).catch(() => null);
      report.steps.push({ step: 2, name: 'Open auth modal', status: 'OK' });
    }

    // 3. Sign Up - switch to sign up mode
    console.log('\n--- Step 3: Sign Up ---');
    await page.getByText('Sign up', { exact: true }).click();
    await page.waitForTimeout(600);

    await page.getByPlaceholder('Your name').fill(SIGNUP.fullName);
    await page.getByPlaceholder('you@example.com').fill(SIGNUP.email);
    await page.getByPlaceholder('••••••••').fill(SIGNUP.password);

    await page.getByRole('button', { name: /create account/i }).click();
    await page.waitForTimeout(5000);

    const successMsg = page.locator('text=Check your email').or(page.locator('[style*="f0fdf4"]')).or(page.locator('.bg-green-50'));
    const errorMsg = page.locator('.bg-red-50, [role="alert"], .border-red-200').first();
    const signUpSuccessVisible = await successMsg.isVisible().catch(() => false);
    const signUpErrorVisible = await errorMsg.isVisible().catch(() => false);
    const signUpErrorText = signUpErrorVisible ? await errorMsg.textContent().catch(() => '') : '';
    const signUpSuccessText = signUpSuccessVisible ? await successMsg.textContent().catch(() => '') : '';

    const modalTextAfterSignup = await modal.textContent().catch(() => '') || '';
    const hasSignUpSuccess = signUpSuccessVisible || /check your email to confirm/i.test(modalTextAfterSignup);
    const hasSignUpError = signUpErrorVisible || /user already registered|already in use/i.test(modalTextAfterSignup);
    report.signUpSuccess = hasSignUpSuccess;
    report.signUpMessage = signUpSuccessVisible ? signUpSuccessText.trim() : (signUpErrorVisible ? signUpErrorText.trim() : (hasSignUpSuccess ? 'Check your email to confirm your account!' : (hasSignUpError ? 'User already registered (from previous test)' : 'Loading or no message captured')));
    report.steps.push({ step: 3, name: 'Sign Up', success: signUpSuccessVisible, message: report.signUpMessage });

    await page.screenshot({ path: path.join(OUTPUT_DIR, '03-signup-result.png'), timeout: 5000 }).catch(() => null);
    console.log(`  Sign up: ${signUpSuccessVisible ? 'SUCCESS' : 'FAIL'}`);
    console.log(`  Message: ${report.signUpMessage}`);

    // 4. Sign In - switch back to sign in mode
    console.log('\n--- Step 4: Sign In ---');
    await page.getByText('Sign in', { exact: true }).first().click();
    await page.waitForTimeout(600);

    await page.getByPlaceholder('you@example.com').fill(SIGNUP.email);
    await page.getByPlaceholder('••••••••').fill(SIGNUP.password);
    await page.locator('form').getByRole('button', { name: /^Sign In$/ }).click();
    await page.waitForTimeout(3000);

    const modalStillOpen = await modal.isVisible().catch(() => false);
    const signOutVisible = await page.getByRole('button', { name: /sign out/i }).isVisible().catch(() => false);
    const userMenuOpen = await page.locator('text=Test User Flow').isVisible().catch(() => false);
    const signInBtnVisible = await page.getByRole('button', { name: /sign in/i }).first().isVisible().catch(() => true);

    let signInErrorText = await page.locator('text=Email not confirmed').textContent().catch(() => null)
      || await page.locator('[style*="fef2f2"] span, [style*="dc2626"]').first().textContent().catch(() => null);
    if (!signInErrorText && modalStillOpen) {
      const modalText = await modal.textContent().catch(() => '') || '';
      if (/email not confirmed/i.test(modalText)) signInErrorText = 'Email not confirmed';
      else if (/invalid|incorrect|wrong/i.test(modalText)) signInErrorText = (modalText.match(/[^\n]{10,120}/g) || []).find(t => /invalid|incorrect|email|password/i.test(t)) || 'Sign-in error';
    }
    const userAvatarVisible = await page.getByRole('button', { name: /open user menu|close user menu/i }).isVisible().catch(() => false);
    report.signInSuccess = !modalStillOpen && (signOutVisible || userAvatarVisible || userMenuOpen);
    if (modalStillOpen && signInErrorText) {
      report.signInMessage = signInErrorText.trim();
      report.signInRequiresConfirmation = /confirm|verification|email/i.test(signInErrorText);
    } else {
      report.signInMessage = report.signInSuccess ? 'Signed in successfully' : (signInErrorText || 'Unknown');
    }

    report.steps.push({ step: 4, name: 'Sign In', success: report.signInSuccess, message: report.signInMessage });
    await page.screenshot({ path: path.join(OUTPUT_DIR, '04-signin-result.png'), timeout: 5000 }).catch(() => null);
    console.log(`  Sign in: ${report.signInSuccess ? 'SUCCESS' : 'FAIL'}`);
    console.log(`  Message: ${report.signInMessage}`);

    // 5. Sign Out (if signed in)
    if (report.signInSuccess) {
      console.log('\n--- Step 5: Sign Out ---');
      const userMenuBtn = page.getByRole('button', { name: /open user menu|close user menu/i }).or(page.locator('button').filter({ has: page.locator('span:has-text("Test User Flow"), span:has-text("testflow")') }).first());
      const avatarBtn = page.locator('button').filter({ has: page.locator('[aria-label]') }).first();
      await userMenuBtn.click().catch(() => avatarBtn.click()).catch(() => page.locator('button').filter({ hasText: /Test User|testflow/i }).first().click());
      await page.waitForTimeout(600);

      const signOutBtn = page.getByRole('button', { name: /sign out/i }).or(page.locator('button, a').filter({ hasText: /sign out/i }));
      await signOutBtn.click();
      await page.waitForTimeout(1500);

      const signInVisibleAgain = await page.getByRole('button', { name: /sign in/i }).first().isVisible().catch(() => false);
      report.signOutSuccess = signInVisibleAgain;
      report.steps.push({ step: 5, name: 'Sign Out', success: report.signOutSuccess });
      await page.screenshot({ path: path.join(OUTPUT_DIR, '05-signed-out.png'), timeout: 5000 }).catch(() => null);
      console.log(`  Sign out: ${report.signOutSuccess ? 'SUCCESS' : 'FAIL'}`);
    } else {
      report.steps.push({ step: 5, name: 'Sign Out', status: 'SKIPPED', details: 'Sign in did not succeed' });
    }

    report.consoleErrors = consoleErrors;
  } catch (err) {
    report.error = err.message;
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
