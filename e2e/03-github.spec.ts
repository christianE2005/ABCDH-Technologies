import { test, expect } from '@playwright/test';
import { mockAuthRoutes, loginViaLocalStorage } from './helpers/auth';

test.describe('CP-03 · Integración con GitHub', () => {

  test.beforeEach(async ({ page }) => {
    await mockAuthRoutes(page);
    await loginViaLocalStorage(page);

    await page.route('**/api/projects/**', (r) =>
      r.fulfill({ status: 200, contentType: 'application/json', body: '[]' }),
    );
    await page.route('**/api/project-members/**', (r) =>
      r.fulfill({ status: 200, contentType: 'application/json', body: '[]' }),
    );
  });

  // ── CP-03-01 ──────────────────────────────────────────────────────────────
  test('CP-03-01 · Página GitHub muestra botón de conexión cuando no está conectado', async ({ page }) => {
    await page.route('**/api/github/connection/status/', (r) =>
      r.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ connected: false }),
      }),
    );

    await page.goto('/github');

    await expect(page.getByRole('button', { name: /Conectar con GitHub/i })).toBeVisible({ timeout: 8000 });
    await expect(page.getByText('Conecta tu cuenta de GitHub')).toBeVisible();
  });

  // ── CP-03-02 ──────────────────────────────────────────────────────────────
  test('CP-03-02 · Botón Conectar inicia el flujo OAuth', async ({ page }) => {
    await page.route('**/api/github/connection/status/', (r) =>
      r.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ connected: false }),
      }),
    );

    // Interceptar la llamada a oauth/start y capturarla sin redirigir
    let oauthStartCalled = false;
    await page.route('**/api/github/app/oauth/start/', async (r) => {
      oauthStartCalled = true;
      await r.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ authorize_url: 'https://github.com/login/oauth/authorize?mock=1' }),
      });
    });

    // Bloquear la navegación externa a GitHub
    await page.route('https://github.com/**', (r) => r.abort());

    await page.goto('/github');
    await page.getByRole('button', { name: /Conectar con GitHub/i }).click();

    await page.waitForTimeout(1500);
    expect(oauthStartCalled).toBe(true);
  });

  // ── CP-03-03 ──────────────────────────────────────────────────────────────
  test('CP-03-03 · Estado conectado muestra información de cuenta', async ({ page }) => {
    await page.route('**/api/github/connection/status/', (r) =>
      r.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ connected: true, github_login: 'Bloodysacrier' }),
      }),
    );

    await page.goto('/github');

    await expect(page.getByText('GitHub conectado')).toBeVisible({ timeout: 8000 });
    await expect(page.getByText('Bloodysacrier')).toBeVisible();
    await expect(page.getByRole('button', { name: /Desconectar/i })).toBeVisible();
  });

  // ── CP-03-04 ──────────────────────────────────────────────────────────────
  test('CP-03-04 · Desconectar GitHub limpia el estado', async ({ page }) => {
    await page.route('**/api/github/connection/status/', (r) =>
      r.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ connected: true, github_login: 'Bloodysacrier' }),
      }),
    );

    await page.goto('/github');
    await expect(page.getByText('GitHub conectado')).toBeVisible({ timeout: 8000 });

    await page.getByRole('button', { name: /Desconectar/i }).click();

    await expect(page.getByRole('button', { name: /Conectar con GitHub/i })).toBeVisible({ timeout: 5000 });
  });

  // ── CP-03-05 ──────────────────────────────────────────────────────────────
  test('CP-03-05 · Crear repositorio con cuenta conectada', async ({ page }) => {
    await page.route('**/api/github/connection/status/', (r) =>
      r.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ connected: true, github_login: 'Bloodysacrier' }),
      }),
    );

    await page.route('**/api/github/repos/**', (r) =>
      r.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          repository: {
            id_repo: 1,
            name: 'test-repo',
            full_name: 'ABCDH-Technologies/test-repo',
            html_url: 'https://github.com/ABCDH-Technologies/test-repo',
            private: true,
          },
        }),
      }),
    );

    await page.goto('/github');
    await expect(page.getByText('GitHub conectado')).toBeVisible({ timeout: 8000 });

    await page.getByRole('button', { name: /Nuevo repositorio/i }).click();
    await expect(page.getByPlaceholder('mi-repositorio')).toBeVisible();

    await page.getByPlaceholder('mi-repositorio').fill('test-repo');
    await page.getByRole('button', { name: /Crear repositorio/i }).click();

    await expect(page.getByText(/Repositorio creado/i)).toBeVisible({ timeout: 5000 });
  });
});
