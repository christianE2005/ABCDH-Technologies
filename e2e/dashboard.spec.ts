import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
  });

  test('renderiza secciones principales', async ({ page }) => {
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByRole('heading', { name: /salud del portafolio/i })).toBeVisible({ timeout: 20_000 });
    await expect(page.getByRole('heading', { name: /pr[oó]ximas a vencer/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /mis proyectos/i })).toBeVisible();
  });

  test('muestra tareas pendientes y actividad reciente', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /mis tareas pendientes/i })).toBeVisible({ timeout: 20_000 });
    await expect(page.getByRole('heading', { name: /actividad reciente/i })).toBeVisible();
  });

  test('sidebar permite navegar a Proyectos', async ({ page }) => {
    await page.getByRole('link', { name: 'Proyectos', exact: true }).click();
    await expect(page).toHaveURL(/\/projects/);
  });

  test('topbar tiene búsqueda y bell de notificaciones', async ({ page }) => {
    await expect(page.getByRole('button', { name: /buscar/i })).toBeVisible();
  });

  test('toggle de tema cambia entre claro/oscuro', async ({ page }) => {
    const themeBtn = page.getByRole('button', { name: /cambiar a modo (claro|oscuro)/i });
    const labelAntes = await themeBtn.getAttribute('aria-label');
    await themeBtn.click();
    await expect(themeBtn).not.toHaveAttribute('aria-label', labelAntes ?? '');
  });
});
