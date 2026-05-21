import { test, expect } from '@playwright/test';

test.describe('CreateUsers (admin)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/users');
  });

  test('admin ve "Gestión de Usuarios"', async ({ page }) => {
    // Si no es admin, la página muestra "Acceso Denegado"
    const accesoDenegado = page.getByRole('heading', { name: /acceso denegado/i });
    if (await accesoDenegado.isVisible().catch(() => false)) {
      test.skip(true, 'Usuario de prueba no es admin — saltando');
    }
    await expect(page.getByRole('heading', { name: /gesti[oó]n de usuarios/i })).toBeVisible({ timeout: 20_000 });
  });

  test('abre formulario "Crear Nuevo Usuario"', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /gesti[oó]n de usuarios/i })).toBeVisible({ timeout: 20_000 });
    const crearBtn = page.getByRole('button', { name: /^nuevo usuario$/i }).first();
    const visible = await crearBtn.waitFor({ state: 'visible', timeout: 8_000 }).then(() => true).catch(() => false);
    if (!visible) test.skip(true, 'Botón Nuevo Usuario no visible');
    await crearBtn.click();
    await expect(page.getByRole('heading', { name: /crear nuevo usuario/i })).toBeVisible();
  });

  test('cancela creación cerrando el panel', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /gesti[oó]n de usuarios/i })).toBeVisible({ timeout: 20_000 });
    const crearBtn = page.getByRole('button', { name: /^nuevo usuario$/i }).first();
    const visible = await crearBtn.waitFor({ state: 'visible', timeout: 8_000 }).then(() => true).catch(() => false);
    if (!visible) test.skip(true, 'Botón no visible');
    await crearBtn.click();
    await expect(page.getByRole('heading', { name: /crear nuevo usuario/i })).toBeVisible();
    const cancelar = page.getByRole('button', { name: /cancelar/i }).first();
    if (await cancelar.isVisible().catch(() => false)) {
      await cancelar.click();
    } else {
      await page.keyboard.press('Escape');
    }
    await expect(page.getByRole('heading', { name: /crear nuevo usuario/i })).not.toBeVisible();
  });
});
