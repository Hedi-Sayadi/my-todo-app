import { test, expect } from '@playwright/test';
import {
  ensureTestUser,
  cleanupCategories,
  cleanupTasks,
  createCategoryViaApi,
  type TestSession,
} from '../helpers';

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
      page.waitForResponse(
        (r) => r.url().includes('/api/categories') && (r.status() === 201 || r.status() === 200)
      ),
      page.getByRole('button', { name: 'Create Category' }).click(),
    ]);

    await page.waitForSelector(`h4:has-text("${name}")`, { timeout: 10000 });
    const heading = page.locator('h4', { hasText: name }).first();
    await expect(heading).toHaveText(name);
  });

  test('Edit category via UI', async ({ page, baseURL }) => {
    const base = baseURL ?? 'http://localhost:3000';
    const originalName = `E2E Edit ${Date.now()}`;
    const newName = `${originalName} - updated`;

    const created = await createCategoryViaApi(page, base, session.token, {
      name: originalName,
      description: 'to be edited',
    });

    await page.goto(base + '/categories');
    await page.waitForSelector(`h4:has-text("${originalName}")`, { timeout: 10000 });

    const card = page.locator('article', { hasText: originalName });
    await card.locator('button:has-text("Edit")').click();

    await page.waitForSelector('text=Edit category');
    await page.fill('#category-name', newName);

    await Promise.all([
      page.waitForResponse(
        (r) => r.url().includes(`/api/categories/${created.id}`) && r.status() === 200
      ),
      page.getByRole('button', { name: 'Update Category' }).click(),
    ]);

    await page.waitForSelector(`h4:has-text("${newName}")`, { timeout: 10000 });
    await expect(page.locator('h4', { hasText: newName }).first()).toHaveText(newName);
  });

  test('Delete category via UI', async ({ page, baseURL }) => {
    const base = baseURL ?? 'http://localhost:3000';
    const name = `E2E Delete ${Date.now()}`;

    await createCategoryViaApi(page, base, session.token, {
      name,
      description: 'to be deleted',
    });

    await page.goto(base + '/categories');
    await page.waitForSelector(`h4:has-text("${name}")`, { timeout: 10000 });

    page.on('dialog', (dialog) => dialog.accept());

    const card = page.locator('article', { hasText: name });
    await card.locator('button:has-text("Delete")').click();

    await expect(page.locator('h4', { hasText: name })).toHaveCount(0, { timeout: 10000 });
  });
});
