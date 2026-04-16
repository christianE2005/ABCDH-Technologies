import { test, expect } from '@playwright/test';
import { mockAuthRoutes, loginViaLocalStorage } from './helpers/auth';

const MOCK_PROJECTS = [
  {
    id_project: 1,
    name: 'CRM Implementation',
    description: 'Sistema CRM corporativo',
    status: 'on_track',
    end_date: '2026-12-31',
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id_project: 2,
    name: 'Portal Web',
    description: null,
    status: 'at_risk',
    end_date: '2026-06-30',
    created_at: '2026-02-01T00:00:00Z',
  },
];

test.describe('CP-02 · Proyectos', () => {

  test.beforeEach(async ({ page }) => {
    await mockAuthRoutes(page);
    await loginViaLocalStorage(page);

    await page.route('**/api/projects/', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(MOCK_PROJECTS),
        });
      } else {
        // POST — crear proyecto
        const body = route.request().postDataJSON();
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            id_project: 99,
            name: body.name,
            description: body.description ?? null,
            status: 'neutral',
            end_date: body.end_date ?? null,
            created_at: new Date().toISOString(),
          }),
        });
      }
    });

    await page.route('**/api/project-members/**', (r) =>
      r.fulfill({ status: 200, contentType: 'application/json', body: '[]' }),
    );
    await page.route('**/api/github/**', (r) =>
      r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ connected: false }) }),
    );
  });

  // ── CP-02-01 ──────────────────────────────────────────────────────────────
  test('CP-02-01 · Lista de proyectos se muestra correctamente', async ({ page }) => {
    await page.goto('/projects');

    await expect(page.getByText('CRM Implementation')).toBeVisible();
    await expect(page.getByText('Portal Web')).toBeVisible();
  });

  // ── CP-02-02 ──────────────────────────────────────────────────────────────
  test('CP-02-02 · Crear proyecto con datos válidos', async ({ page }) => {
    await page.goto('/projects');

    await page.getByRole('button', { name: /Nuevo Proyecto/i }).click();

    const modal = page.getByText('Nuevo Proyecto').nth(1);
    await expect(modal).toBeVisible({ timeout: 3000 });

    await page.getByPlaceholder('Ej: CRM Implementation').fill('Proyecto de Prueba E2E');
    await page.getByPlaceholder('Objetivo y alcance del proyecto').fill('Descripción de prueba');

    await page.getByRole('button', { name: /^Crear$/i }).click();

    await expect(page.getByText(/Proyecto creado exitosamente/i)).toBeVisible({ timeout: 5000 });
  });

  // ── CP-02-03 ──────────────────────────────────────────────────────────────
  test('CP-02-03 · No se puede crear proyecto sin nombre', async ({ page }) => {
    await page.goto('/projects');

    await page.getByRole('button', { name: /Nuevo Proyecto/i }).click();
    await expect(page.getByPlaceholder('Ej: CRM Implementation')).toBeVisible();

    // Click crear sin llenar nombre
    await page.getByRole('button', { name: /^Crear$/i }).click();

    // El campo requerido bloquea el submit (validación HTML5 nativa)
    await expect(page.getByPlaceholder('Ej: CRM Implementation')).toBeVisible();
    await expect(page.getByText(/Proyecto creado/i)).not.toBeVisible();
  });

  // ── CP-02-04 ──────────────────────────────────────────────────────────────
  test('CP-02-04 · Buscar proyectos por nombre', async ({ page }) => {
    await page.goto('/projects');

    await expect(page.getByText('CRM Implementation')).toBeVisible();
    await expect(page.getByText('Portal Web')).toBeVisible();

    await page.getByPlaceholder('Buscar proyectos…').fill('CRM');

    await expect(page.getByText('CRM Implementation')).toBeVisible();
    await expect(page.getByText('Portal Web')).not.toBeVisible();
  });

  // ── CP-02-05 ──────────────────────────────────────────────────────────────
  test('CP-02-05 · Cancelar modal no crea proyecto', async ({ page }) => {
    await page.goto('/projects');

    await page.getByRole('button', { name: /Nuevo Proyecto/i }).click();
    await page.getByPlaceholder('Ej: CRM Implementation').fill('Proyecto Cancelado');

    await page.getByRole('button', { name: /Cancelar/i }).click();

    await expect(page.getByText('Proyecto Cancelado')).not.toBeVisible();
  });
});
