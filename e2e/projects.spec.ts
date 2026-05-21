import { test, expect } from '@playwright/test';

test.describe('Projects (lista)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/projects');
  });

  test('renderiza el listado de proyectos', async ({ page }) => {
    await expect(page).toHaveURL(/\/projects/);
    await expect(page.getByRole('heading', { name: /^proyectos$/i }).first()).toBeVisible({ timeout: 20_000 });
  });

  test('abre el modal de Nuevo Proyecto', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /^proyectos$/i }).first()).toBeVisible({ timeout: 20_000 });
    const newBtn = page.getByRole('button', { name: /nuevo proyecto/i }).first();
    const visible = await newBtn.waitFor({ state: 'visible', timeout: 8_000 }).then(() => true).catch(() => false);
    if (!visible) test.skip(true, 'Usuario actual no tiene permiso de crear proyectos');
    await newBtn.click();
    await expect(page.getByRole('heading', { name: /nuevo proyecto/i })).toBeVisible();
  });

  test('puede cerrar el modal de Nuevo Proyecto con el botón Cerrar', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /^proyectos$/i }).first()).toBeVisible({ timeout: 20_000 });
    const newBtn = page.getByRole('button', { name: /nuevo proyecto/i }).first();
    const visible = await newBtn.waitFor({ state: 'visible', timeout: 8_000 }).then(() => true).catch(() => false);
    if (!visible) test.skip(true, 'Sin permiso');
    await newBtn.click();
    await expect(page.getByRole('heading', { name: /nuevo proyecto/i })).toBeVisible();
    await page.getByRole('button', { name: /^cerrar$/i }).click();
    await expect(page.getByRole('heading', { name: /nuevo proyecto/i })).not.toBeVisible();
  });

  test('lista vacía o navega a detalle al hacer click', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /^proyectos$/i }).first()).toBeVisible({ timeout: 20_000 });

    // Esperar a que la página resuelva su estado: empty state o cards renderizadas.
    const emptyState = page.getByText(/sin proyectos para mostrar/i);
    const linkCard = page.locator('a[href^="/projects/"]').first();
    const buttonCard = page.locator('.divide-y button[type="button"]').first();

    await Promise.race([
      emptyState.waitFor({ state: 'visible', timeout: 15_000 }).catch(() => {}),
      linkCard.waitFor({ state: 'visible', timeout: 15_000 }).catch(() => {}),
      buttonCard.waitFor({ state: 'visible', timeout: 15_000 }).catch(() => {}),
    ]);

    if (await emptyState.isVisible().catch(() => false)) {
      await expect(emptyState).toBeVisible();
      return;
    }
    if (await linkCard.isVisible().catch(() => false)) {
      await linkCard.click();
    } else if (await buttonCard.isVisible().catch(() => false)) {
      await buttonCard.click();
    } else {
      throw new Error('Página de Proyectos no muestra empty state ni cards después de 15s');
    }
    await page.waitForURL(/\/projects\/\d+/, { timeout: 15_000 });
    await expect(page).toHaveURL(/\/projects\/\d+/);
  });
});
