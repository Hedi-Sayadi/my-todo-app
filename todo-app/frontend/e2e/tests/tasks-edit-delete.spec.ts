import { test, expect } from '@playwright/test';
import { ensureTestUser, cleanupTasks, cleanupCategories, createCategoryViaApi } from '../helpers';

test.describe('Tasks edit/delete - system tests', () => {
  let session: any;

  test.beforeEach(async ({ page, baseURL }, testInfo) => {
    const base = baseURL ?? 'http://localhost:3000';
    const backend = process.env.BACKEND_URL ?? 'http://localhost:8080';
    const email = `e2e-editdelete-${testInfo.workerIndex}@example.com`;
    session = await ensureTestUser(page, base, { backendUrl: backend, email });
    await cleanupCategories(page, base, session.token);
    await cleanupTasks(page, base, session.token);
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

  test('Edit task title and delete it via UI', async ({ page, baseURL }) => {
    const base = baseURL ?? 'http://localhost:3000';

    // create a task via UI
    await page.goto(base + '/tasks');
    await page.waitForSelector('text=Add Task');
    await page.click('text=Add Task');
    await page.waitForSelector('#category');

    const title = `E2E EditTask ${Date.now()}`;
    await page.fill('#title', title);
    await page.fill('#description', 'Will be edited');
    await Promise.all([
      page.waitForResponse((r) => r.url().includes('/api/tasks') && (r.status() === 201 || r.status() === 200)),
      page.getByRole('button', { name: 'Create Task' }).click(),
    ]);

    await page.waitForSelector(`h4:has-text("${title}")`, { timeout: 15000 });

    // open edit modal for that task
    await page.click(`div:has(h4:has-text("${title}")) button[title="Edit task"]`);

    const newTitle = title + ' - updated';
    await page.fill('#title', newTitle);
    await Promise.all([
      page.waitForResponse((r) => r.url().includes('/api/tasks') && (r.status() === 200)),
      page.getByRole('button', { name: 'Update Task' }).click(),
    ]);

    await page.waitForSelector(`h4:has-text("${newTitle}")`, { timeout: 15000 });

    // delete the task
    await page.click(`div:has(h4:has-text("${newTitle}")) button[title="Delete task"]`);

    // ensure it disappears
    await expect(page.locator(`h4:has-text("${newTitle}")`)).toHaveCount(0);
  });
});
