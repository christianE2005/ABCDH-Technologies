import { test, expect } from '@playwright/test';

test.describe('Landing (público)', () => {
  test('carga la página y muestra branding ABCDH', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/ABCDH|Project Intelligence|PI/i);
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('tiene CTA hacia /login', async ({ page }) => {
    await page.goto('/');
    const loginLink = page.getByRole('link', { name: /iniciar sesi[oó]n|login|comenzar|empezar/i }).first();
    await expect(loginLink).toBeVisible();
  });

  test('navega a /login al hacer click en CTA', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /iniciar sesi[oó]n|login/i }).first().click();
    await expect(page).toHaveURL(/\/login/);
  });
});
