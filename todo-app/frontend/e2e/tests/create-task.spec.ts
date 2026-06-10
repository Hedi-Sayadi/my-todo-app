import { test, expect } from '@playwright/test';
import { ensureTestUser, cleanupTasks, cleanupCategories, createCategoryViaApi } from '../helpers';

test.describe('Tasks - system tests', () => {
  let session: any;

  test.beforeEach(async ({ page, baseURL }, testInfo) => {
    const base = baseURL ?? 'http://localhost:3000';
    const backend = process.env.BACKEND_URL ?? 'http://localhost:8080';
    const email = `e2e-createtask-${testInfo.workerIndex}@example.com`;
    session = await ensureTestUser(page, base, { backendUrl: backend, email });
    await cleanupCategories(page, base, session.token);
    await cleanupTasks(page, base, session.token);
    // ensure at least one category exists so the task form can be submitted
    await createCategoryViaApi(page, base, session.token, {
      name: `E2E Category ${Date.now()}`,
      description: 'auto-created by e2e',
    });
  });

  test.afterEach(async ({ page, baseURL }) => {
    const base = baseURL ?? 'http://localhost:3000';
    if (session?.token) {
      await cleanupTasks(page, base, session.token);
      await cleanupCategories(page, base, session.token);
    }
  });

  test('Create task via UI', async ({ page, baseURL }) => {
    const base = baseURL ?? 'http://localhost:3000';

    // Navigate to tasks page
    await page.goto(base + '/tasks');

    // Wait for page ready and open Create Task modal
    await page.waitForSelector('text=Add Task');
    await page.click('text=Add Task');

    const title = `E2E Task ${Date.now()}`;
    await page.fill('#title', title);
    await page.fill('#description', 'Created by Playwright E2E test');

    // set deadline (YYYY-MM-DD)
    const deadline = '2026-06-12';
    await page.fill('#deadline', deadline);

    // submit the form and wait for the new card to appear
    await page.click('text=Create Task');

    // wait for modal to close and task to appear in list
    await page.waitForSelector(`h4:has-text("${title}")`, { timeout: 15000 });

    const heading = page.locator('h4', { hasText: title }).first();
    await expect(heading).toHaveText(title);
  });
});
