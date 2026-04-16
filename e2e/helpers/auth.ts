import { Page } from '@playwright/test';

export const TEST_USER = {
  email: 'admin@techmahindra.com',
  password: 'password123',
};

export const MOCK_TOKENS = {
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
};

export const MOCK_USER = {
  id: 1,
  email: TEST_USER.email,
  username: 'Admin',
  role: 'admin',
  is_admin: true,
};

/** Intercepts auth API calls and injects tokens into localStorage so tests start logged in. */
export async function mockAuthRoutes(page: Page) {
  await page.route('**/api/auth/login/', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ...MOCK_TOKENS, user: MOCK_USER }),
    });
  });

  await page.route('**/api/auth/refresh/', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ access_token: MOCK_TOKENS.access_token }),
    });
  });

  await page.route('**/api/users/me/', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_USER),
    });
  });
}

/** Sets tokens + user directly in localStorage (skips login UI). */
export async function loginViaLocalStorage(page: Page) {
  await page.goto('/');
  await page.evaluate(
    ({ tokens, user }) => {
      localStorage.setItem('pip_access_token', tokens.access_token);
      localStorage.setItem('pip_refresh_token', tokens.refresh_token);
      localStorage.setItem('pip_user', JSON.stringify(user));
    },
    { tokens: MOCK_TOKENS, user: { id: MOCK_USER.id, name: MOCK_USER.username, email: MOCK_USER.email, role: MOCK_USER.role } },
  );
}
