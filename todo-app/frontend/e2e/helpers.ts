import type { Page, APIResponse } from '@playwright/test';

const AUTH_STORAGE_KEY = 'todo-app-auth';

export type TestSession = {
  token: string;
  user: unknown;
  expiresAt: number;
};

type AuthResponse = {
  token: string;
  tokenType?: string;
  expiresInMillis?: number;
  user?: Record<string, unknown>;
};

export async function ensureTestUser(
  page: Page,
  baseURL: string,
  opts?: { email?: string; password?: string; backendUrl?: string }
) {
  const email = opts?.email ?? `e2euser@example.com`;
  const password = opts?.password ?? 'password123';

  // Prefer an explicit backend URL (helps avoid relying on Vite proxy)
  const backend = opts?.backendUrl ?? process.env.BACKEND_URL ?? 'http://localhost:8080';
  const loginUrl = `${backend.replace(/\/$/, '')}/api/auth/login`;
  const registerUrl = `${backend.replace(/\/$/, '')}/api/auth/register`;

  // try login first
  let resp: APIResponse | null;
  try {
    resp = await page.request.post(loginUrl, { data: { email, password } });
  } catch {
    resp = null;
  }

  let body: AuthResponse | null;

  async function parseJsonSafe(r: APIResponse) {
    const ct = r.headers()['content-type'] ?? '';
    if (!r.ok()) {
      const text = await r.text();
      throw new Error(`E2E: request failed ${r.status()} - ${text}`);
    }
    if (ct.includes('application/json')) return (await r.json()) as AuthResponse;
    const text = await r.text();
    throw new Error(`E2E: expected JSON response but got: ${text}`);
  }

  if (resp && resp.ok()) {
    body = await parseJsonSafe(resp);
  } else {
    // register user (idempotent if different email used each run)
    const registerPayload = {
      firstName: 'E2E',
      lastName: 'User',
      email,
      password,
      confirmPassword: password,
    };
    const regResp = await page.request.post(registerUrl, { data: registerPayload });
    body = await parseJsonSafe(regResp);
  }

  if (!body || !body.token) throw new Error('E2E: auth response missing token');

  const session = {
    token: body.token,
    user: body.user ?? null,
    expiresAt: Date.now() + (body.expiresInMillis ?? 1000 * 60 * 60),
  };

  // ensure we are on the app origin so localStorage operations work
  await page.goto(baseURL);
  await page.evaluate(
    ([key, data]) => window.localStorage.setItem(key, data),
    [AUTH_STORAGE_KEY, JSON.stringify(session)]
  );

  return session;
}

export async function cleanupTasks(page: Page, baseURL: string, token: string) {
  const backend = process.env.BACKEND_URL ?? 'http://localhost:8080';
  const tasksUrl = `${backend.replace(/\/$/, '')}/api/tasks`;
  const listResp = await page.request.get(tasksUrl, { headers: { Authorization: `Bearer ${token}` } });
  if (!listResp.ok()) {
    const text = await listResp.text();
    throw new Error(`E2E: cleanup tasks list failed: ${listResp.status()} ${text}`);
  }
  const ct = listResp.headers()['content-type'] ?? '';
  if (!ct.includes('application/json')) {
    const text = await listResp.text();
    throw new Error(`E2E: cleanup tasks: expected JSON but got: ${text}`);
  }
  const tasks = (await listResp.json()) as Array<{ id: number }>;
  await Promise.all(
    tasks.map((t) => page.request.delete(`${tasksUrl}/${t.id}`, { headers: { Authorization: `Bearer ${token}` } }))
  );
}

export async function cleanupCategories(page: Page, baseURL: string, token: string) {
  const backend = process.env.BACKEND_URL ?? 'http://localhost:8080';

  const url = `${backend.replace(/\/$/, '')}/api/categories`;
  const listResp = await page.request.get(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!listResp.ok()) {
    const text = await listResp.text();
    throw new Error(`E2E: cleanup categories list failed: ${listResp.status()} ${text}`);
  }
  const ct = listResp.headers()['content-type'] ?? '';
  if (!ct.includes('application/json')) {
    const text = await listResp.text();
    throw new Error(`E2E: cleanup categories: expected JSON but got: ${text}`);
  }
  const items = (await listResp.json()) as Array<{ id: number }>;
  await Promise.all(
    items.map((t) => page.request.delete(`${url}/${t.id}`, { headers: { Authorization: `Bearer ${token}` } }))
  );
}

export async function cleanupReminders(page: Page, baseURL: string, token: string) {
  const backend = process.env.BACKEND_URL ?? 'http://localhost:8080';
  const url = `${backend.replace(/\/$/, '')}/api/reminders`;
  const listResp = await page.request.get(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!listResp.ok()) {
    const text = await listResp.text();
    throw new Error(`E2E: cleanup reminders list failed: ${listResp.status()} ${text}`);
  }
  const ct = listResp.headers()['content-type'] ?? '';
  if (!ct.includes('application/json')) {
    const text = await listResp.text();
    throw new Error(`E2E: cleanup reminders: expected JSON but got: ${text}`);
  }
  const items = (await listResp.json()) as Array<{ id: number }>;
  await Promise.all(
    items.map((t) => page.request.delete(`${url}/${t.id}`, { headers: { Authorization: `Bearer ${token}` } }))
  );
}

export async function createCategoryViaApi(
  page: Page,
  baseURL: string,
  token: string,
  payload: { name: string; description?: string }
) {
  const backend = process.env.BACKEND_URL ?? 'http://localhost:8080';
  const url = `${backend.replace(/\/$/, '')}/api/categories`;
  const resp = await page.request.post(url, {
    data: {
      name: payload.name,
      description: payload.description ?? '',
    },
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!resp.ok()) {
    const text = await resp.text();
    throw new Error(`E2E: create category failed: ${resp.status()} ${text}`);
  }
  return resp.json();
}

export async function createTaskViaApi(
  page: Page,
  baseURL: string,
  token: string,
  payload: { title: string; description?: string; deadline?: string; categoryId?: number }
) {
  const backend = process.env.BACKEND_URL ?? 'http://localhost:8080';
  const url = `${backend.replace(/\/$/, '')}/api/tasks`;
  // ensure we have a category id (backend validates categoryId)
  let categoryId = payload.categoryId;
  if (!categoryId) {
    const catResp = await page.request.post(`${backend.replace(/\/$/, '')}/api/categories`, {
      data: { name: `E2E category ${Date.now()}`, description: 'auto-created by e2e' },
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!catResp.ok()) {
      const text = await catResp.text();
      throw new Error(`E2E: create category failed: ${catResp.status()} ${text}`);
    }
    const createdCat = await catResp.json();
    categoryId = createdCat.id;
  }

  const resp = await page.request.post(url, {
    data: {
      title: payload.title,
      description: payload.description ?? '',
      deadline: payload.deadline ?? null,
      categoryId: categoryId,
      priority: 'MEDIUM',
      status: 'TODO',
    },
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!resp.ok()) {
    const text = await resp.text();
    throw new Error(`E2E: create task failed: ${resp.status()} ${text}`);
  }
  return resp.json();
}
