import { test, expect } from '@playwright/test';

test.describe('Profile', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/profile');
  });

  test('renderiza Mi Perfil', async ({ page }) => {
    await expect(page).toHaveURL(/\/profile/);
    await expect(page.getByRole('heading', { name: /mi perfil/i })).toBeVisible({ timeout: 20_000 });
  });

  test('muestra secciones Información, Mis Proyectos, Preferencias, Seguridad', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /informaci[oó]n personal/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /mis proyectos/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /preferencias/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /seguridad/i })).toBeVisible();
  });

  test('se puede acceder a Perfil desde el user menu', async ({ page }) => {
    await page.goto('/dashboard');
    await page.getByRole('button', { name: /men[uú] de usuario/i }).click();
    await page.getByRole('button', { name: /ver perfil/i }).click();
    await expect(page).toHaveURL(/\/profile/);
  });
});
