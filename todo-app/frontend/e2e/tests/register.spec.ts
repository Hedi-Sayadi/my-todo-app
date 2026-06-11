import { test, expect } from '@playwright/test';

test.describe('Register - system tests', () => {
  test('Register via UI redirects to dashboard', async ({ page, baseURL }) => {
    const base = baseURL ?? 'http://localhost:3000';
    const email = `e2e-register-${Date.now()}@example.com`;
    const password = 'password123';

    await page.goto(base + '/register');
    await page.waitForSelector('text=Create Account');

    await page.fill('#firstName', 'E2E');
    await page.fill('#lastName', 'Register');
    await page.fill('#email', email);
    await page.fill('#password', password);
    await page.fill('#confirmPassword', password);

    await Promise.all([
      page.waitForResponse((r) => r.url().includes('/api/auth/register') && r.status() === 201),
      page.getByRole('button', { name: 'Sign Up' }).click(),
    ]);

    await page.waitForURL(base + '/', { timeout: 10000 });
    await expect(page.locator('text=Task dashboard')).toBeVisible();
  });

  test('Register with mismatched passwords shows error', async ({ page, baseURL }) => {
    const base = baseURL ?? 'http://localhost:3000';

    await page.goto(base + '/register');
    await page.waitForSelector('text=Create Account');

    await page.fill('#firstName', 'E2E');
    await page.fill('#lastName', 'Register');
    await page.fill('#email', `e2e-mismatch-${Date.now()}@example.com`);
    await page.fill('#password', 'password123');
    await page.fill('#confirmPassword', 'different123');

    await page.getByRole('button', { name: 'Sign Up' }).click();

    await expect(page.locator('text=Passwords do not match')).toBeVisible({ timeout: 5000 });
  });

  test('Register with empty fields shows validation error', async ({ page, baseURL }) => {
    const base = baseURL ?? 'http://localhost:3000';

    await page.goto(base + '/register');
    await page.waitForSelector('text=Create Account');

    await page.getByRole('button', { name: 'Sign Up' }).click();

    await expect(page.locator('text=Please fill in all fields')).toBeVisible({ timeout: 5000 });
  });
});
