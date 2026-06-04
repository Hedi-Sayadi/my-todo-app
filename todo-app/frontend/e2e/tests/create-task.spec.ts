import { test, expect } from '@playwright/test';

test.describe('Tasks - system tests', () => {
  test('Create task via UI', async ({ page, baseURL }) => {
    // Navigate to tasks page
    await page.goto((baseURL ?? 'http://localhost:3000') + '/tasks');

    // Wait for page ready and open Create Task modal
    await page.waitForSelector('text=Add Task');
    await page.click('text=Add Task');

    const title = `E2E Task ${Date.now()}`;
    await page.fill('#title', title);
    await page.fill('#description', 'Created by Playwright E2E test');

    // set deadline (YYYY-MM-DD)
    const deadline = '2026-06-12';
    await page.fill('#deadline', deadline);

    // submit
    await page.click('text=Create Task');

    // wait for modal to close and task to appear in list
    await page.waitForSelector(`h3:has-text("${title}")`);

    const heading = page.locator('h3', { hasText: title }).first();
    await expect(heading).toHaveText(title);
  });
});
