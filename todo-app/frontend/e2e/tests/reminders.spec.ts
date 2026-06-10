import { test, expect } from '@playwright/test';
import {
  ensureTestUser,
  cleanupTasks,
  cleanupReminders,
  createTaskViaApi,
  type TestSession,
} from '../helpers';

test.describe('Reminders - system tests', () => {
  let session: TestSession;

  test.beforeEach(async ({ page, baseURL }, testInfo) => {
    const base = baseURL ?? 'http://localhost:3000';
    const backend = process.env.BACKEND_URL ?? 'http://localhost:8080';
    const email = `e2e-reminders-${testInfo.workerIndex}@example.com`;
    session = await ensureTestUser(page, base, { backendUrl: backend, email });
    await cleanupReminders(page, base, session.token);
    await cleanupTasks(page, base, session.token);
  });

  test.afterEach(async ({ page, baseURL }) => {
    const base = baseURL ?? 'http://localhost:3000';
    if (session?.token) {
      await cleanupReminders(page, base, session.token);
      await cleanupTasks(page, base, session.token);
    }
  });

  test('Create reminder for a task and mark done', async ({ page, baseURL }) => {
    const base = baseURL ?? 'http://localhost:3000';

    // create a task via API so we have something to attach a reminder to
    const title = `E2E Task For Reminder ${Date.now()}`;
    const created = await createTaskViaApi(page, base, session.token, {
      title,
      description: 'for reminder',
    });

    await page.goto(base + '/reminders');
    await page.waitForSelector('text=+ Add Reminder');

    await page.click('text=+ Add Reminder');
    await page.waitForSelector('#reminder-task');

    // select task in dropdown
    await page.selectOption('#reminder-task', String(created.id));

    // set reminder time a bit in the future
    const dt = new Date(Date.now() + 60 * 60 * 1000);
    const pad = (n: number) => String(n).padStart(2, '0');
    const dtLocal = `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(
      dt.getHours()
    )}:${pad(dt.getMinutes())}`;

    await page.fill('#reminder-at', dtLocal);
    await page.fill('#reminder-note', 'E2E reminder note');

    await Promise.all([
      page.waitForResponse(
        (r) => r.url().includes('/api/reminders') && (r.status() === 201 || r.status() === 200)
      ),
      page.getByRole('button', { name: 'Create Reminder' }).click(),
    ]);

    // reminder card should appear
    await page.waitForSelector(`h4:has-text("${title}")`, { timeout: 10000 });

    // mark done
    await page.click(`div:has(h4:has-text("${title}")) button:has-text("Mark done")`);

    // the status chip should change to Done (we assert that the Mark done button is no longer present)
    await expect(
      page.locator(`div:has(h4:has-text("${title}")) button:has-text("Mark done")`)
    ).toHaveCount(0);
  });
});
