import { test, expect } from '@playwright/test';

test.describe('Settings', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/settings');
  });

  test('carga la página', async ({ page }) => {
    await expect(page).toHaveURL(/\/settings/);
    // Breadcrumb confirma la ruta aunque no haya h1
    await expect(page.locator('nav[aria-label="Breadcrumb"]').getByText(/configuraci[oó]n/i)).toBeVisible({ timeout: 20_000 });
  });
});
