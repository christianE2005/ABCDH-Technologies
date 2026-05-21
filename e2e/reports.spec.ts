import { test, expect } from '@playwright/test';

test.describe('Reports', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/reports');
  });

  test('carga la página de reportes', async ({ page }) => {
    await expect(page).toHaveURL(/\/reports/);
    await expect(page.locator('nav[aria-label="Breadcrumb"]').getByText(/reportes/i)).toBeVisible({ timeout: 20_000 });
  });
});
