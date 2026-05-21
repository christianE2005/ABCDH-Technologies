import { test, expect } from '@playwright/test';

test.describe('GitHub integration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/github');
  });

  test('carga la página de GitHub', async ({ page }) => {
    await expect(page).toHaveURL(/\/github/);
    // La página tiene varios estados/h1, asegurar que al menos uno está visible
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 20_000 });
  });
});
