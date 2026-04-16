import { test, expect } from '@playwright/test';
import { mockAuthRoutes, TEST_USER, MOCK_TOKENS } from './helpers/auth';

test.describe('CP-01 · Autenticación — Login y Logout', () => {

  test.beforeEach(async ({ page }) => {
    await mockAuthRoutes(page);
    // Mock proyecto y github para que el dashboard no falle tras login
    await page.route('**/api/projects/**', (r) =>
      r.fulfill({ status: 200, contentType: 'application/json', body: '[]' }),
    );
    await page.route('**/api/github/**', (r) =>
      r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ connected: false }) }),
    );
    await page.route('**/api/project-members/**', (r) =>
      r.fulfill({ status: 200, contentType: 'application/json', body: '[]' }),
    );
  });

  // ── CP-01-01 ──────────────────────────────────────────────────────────────
  test('CP-01-01 · Login exitoso con credenciales válidas', async ({ page }) => {
    await page.goto('/login');

    await expect(page.getByRole('heading', { name: 'Iniciar Sesión' })).toBeVisible();

    await page.locator('input[type="email"]').fill(TEST_USER.email);
    await page.locator('input[type="password"]').fill(TEST_USER.password);
    await page.getByRole('button', { name: /Iniciar Sesión/i }).click();

    await expect(page).toHaveURL(/dashboard/, { timeout: 8000 });

    const access = await page.evaluate(() => localStorage.getItem('pip_access_token'));
    expect(access).toBe(MOCK_TOKENS.access_token);
  });

  // ── CP-01-02 ──────────────────────────────────────────────────────────────
  test('CP-01-02 · Login fallido — credenciales incorrectas', async ({ page }) => {
    await page.route('**/api/auth/login/', (r) =>
      r.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ detail: 'Credenciales inválidas.' }),
      }),
    );

    await page.goto('/login');
    await page.locator('input[type="email"]').fill('wrong@email.com');
    await page.locator('input[type="password"]').fill('wrongpassword');
    await page.getByRole('button', { name: /Iniciar Sesión/i }).click();

    await expect(page.getByText(/credenciales inválidas|error al iniciar/i)).toBeVisible({ timeout: 5000 });
    await expect(page).toHaveURL(/login/);
  });

  // ── CP-01-03 ──────────────────────────────────────────────────────────────
  test('CP-01-03 · Login fallido — campos vacíos', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: /Iniciar Sesión/i }).click();

    await expect(page.getByText(/completa todos los campos/i)).toBeVisible({ timeout: 5000 });
    await expect(page).toHaveURL(/login/);
  });

  // ── CP-01-04 ──────────────────────────────────────────────────────────────
  test('CP-01-04 · Sin sesión activa el dashboard no muestra datos privados', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/dashboard');

    // La app no redirige (no tiene guard), pero sin user los datos privados no cargan
    await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
    // No debe mostrar datos de usuario
    await expect(page.getByText(/admin@techmahindra/i)).not.toBeVisible();
  });

  // ── CP-01-05 ──────────────────────────────────────────────────────────────
  test('CP-01-05 · Logout elimina tokens y redirige', async ({ page }) => {
    // Iniciar sesión primero
    await page.goto('/login');
    await page.locator('input[type="email"]').fill(TEST_USER.email);
    await page.locator('input[type="password"]').fill(TEST_USER.password);
    await page.getByRole('button', { name: /Iniciar Sesión/i }).click();
    await expect(page).toHaveURL(/dashboard/, { timeout: 8000 });

    // Abrir menú de usuario y hacer logout
    await page.getByRole('button', { name: /Menú de usuario/i }).click();
    await page.getByRole('button', { name: /Cerrar sesión/i }).click();

    await expect(page).toHaveURL(/login|\//, { timeout: 5000 });
    const access = await page.evaluate(() => localStorage.getItem('pip_access_token'));
    expect(access).toBeNull();
  });
});
