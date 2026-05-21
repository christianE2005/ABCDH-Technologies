import { test, expect } from '@playwright/test';

test.describe('Backlog', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/backlog');
  });

  test('renderiza Product Backlog', async ({ page }) => {
    await expect(page).toHaveURL(/\/backlog/);
    await expect(page.getByRole('heading', { name: /product backlog/i })).toBeVisible({ timeout: 20_000 });
  });

  test('breadcrumb muestra "Backlog"', async ({ page }) => {
    await expect(page.locator('nav[aria-label="Breadcrumb"]').getByText(/backlog/i)).toBeVisible();
  });
});
