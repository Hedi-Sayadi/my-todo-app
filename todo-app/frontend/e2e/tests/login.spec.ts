import { test, expect } from '@playwright/test';

const backend = process.env.BACKEND_URL ?? 'http://localhost:8080';

function registerUrl() {
  return `${backend.replace(/\/$/, '')}/api/auth/register`;
}

test.describe('Login - system tests', () => {
  test('Login via UI', async ({ page, baseURL }) => {
    const base = baseURL ?? 'http://localhost:3000';

    // 1. Register a user via API so we have credentials to log in with
    const email = `e2e-login-${Date.now()}@example.com`;
    const password = 'password123';
    const regResp = await page.request.post(registerUrl(), {
      data: {
        firstName: 'E2E',
        lastName: 'User',
        email,
        password,
        confirmPassword: password,
      },
    });

    if (!regResp.ok()) {
      const text = await regResp.text();
      throw new Error(`E2E: register failed: ${regResp.status()} ${text}`);
    }

    // 2. Navigate to login page
    await page.goto(base + '/login');
    await page.waitForSelector('text=Sign In');

    // 3. Fill the login form
    await page.fill('#email', email);
    await page.fill('#password', password);

    // 4. Submit and wait for redirect to dashboard
    await Promise.all([
      page.waitForResponse((r) => r.url().includes('/api/auth/login') && r.status() === 200),
      page.getByRole('button', { name: 'Sign In' }).click(),
    ]);

    await page.waitForURL(base + '/', { timeout: 10000 });

    // 5. Assert dashboard is visible
    await expect(page.locator('text=Task dashboard')).toBeVisible();
  });

  test('Login with invalid credentials shows error', async ({ page, baseURL }) => {
    const base = baseURL ?? 'http://localhost:3000';

    await page.goto(base + '/login');
    await page.waitForSelector('text=Sign In');

    await page.fill('#email', `nonexistent-${Date.now()}@example.com`);
    await page.fill('#password', 'wrongpassword');

    await page.getByRole('button', { name: 'Sign In' }).click();

    // Error message should appear
    await expect(page.locator('text=Invalid email or password')).toBeVisible({ timeout: 5000 });
  });

  test('Login with empty fields shows validation error', async ({ page, baseURL }) => {
    const base = baseURL ?? 'http://localhost:3000';

    await page.goto(base + '/login');
    await page.waitForSelector('text=Sign In');

    // Click sign in without filling anything
    await page.getByRole('button', { name: 'Sign In' }).click();

    await expect(page.locator('text=Please fill in all fields')).toBeVisible({ timeout: 5000 });
  });
});
