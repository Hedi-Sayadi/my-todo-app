import { test, expect } from '@playwright/test';
import { ensureTestUser, cleanupCategories, cleanupTasks, type TestSession } from '../helpers';

test.describe('Categories - system tests', () => {
  let session: TestSession;

  test.beforeEach(async ({ page, baseURL }) => {
    const base = baseURL ?? 'http://localhost:3000';
    session = await ensureTestUser(page, base);
    await cleanupCategories(page, base, session.token);
    await cleanupTasks(page, base, session.token);
  });

  test.afterEach(async ({ page, baseURL }) => {
    const base = baseURL ?? 'http://localhost:3000';
    if (session?.token) {
      await cleanupCategories(page, base, session.token);
      await cleanupTasks(page, base, session.token);
    }
  });

  test('Create category via UI', async ({ page, baseURL }) => {
    const base = baseURL ?? 'http://localhost:3000';
    await page.goto(base + '/categories');

    const name = `E2E Category ${Date.now()}`;
    const desc = 'Created by Playwright system test';

    await page.waitForSelector('text=+ New Category');
    await page.click('text=+ New Category');

    await page.fill('#category-name', name);
    await page.fill('#category-description', desc);

    await Promise.all([
      page.waitForResponse((r) => r.url().includes('/api/categories') && (r.status() === 201 || r.status() === 200)),
      page.getByRole('button', { name: 'Create Category' }).click(),
    ]);

    await page.waitForSelector(`h4:has-text("${name}")`, { timeout: 10000 });
    const heading = page.locator('h4', { hasText: name }).first();
    await expect(heading).toHaveText(name);
  });
});
