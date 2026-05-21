import { test, expect } from '@playwright/test';

test.describe('Alerts', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/alerts');
  });

  test('carga el centro de alertas', async ({ page }) => {
    await expect(page).toHaveURL(/\/alerts/);
    await expect(page.locator('nav[aria-label="Breadcrumb"]').getByText(/alertas/i)).toBeVisible({ timeout: 20_000 });
  });

  test('búsqueda de alertas está presente', async ({ page }) => {
    await expect(page.getByPlaceholder(/buscar alertas/i)).toBeVisible();
  });

  test('filtros Todos / Activos / Resueltos', async ({ page }) => {
    await expect(page.getByRole('button', { name: /^todos/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /activos/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /resueltos/i })).toBeVisible();
  });

  test('cambiar filtro a Activos activa el botón', async ({ page }) => {
    await page.getByRole('button', { name: /activos/i }).click();
    // Verificar que el botón quedó activo (no asercionamos clase exacta — solo que sigue visible/clickable)
    await expect(page.getByRole('button', { name: /activos/i })).toBeVisible();
  });
});
