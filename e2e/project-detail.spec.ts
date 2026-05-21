import { test, expect } from '@playwright/test';

test.describe('Project Detail', () => {
  async function openFirstProject(page: import('@playwright/test').Page) {
    await page.goto('/projects');
    await expect(page.getByRole('heading', { name: /^proyectos$/i }).first()).toBeVisible({ timeout: 20_000 });

    const emptyState = page.getByText(/sin proyectos para mostrar/i);
    const linkCard = page.locator('a[href^="/projects/"]').first();
    const buttonCard = page.locator('.divide-y button[type="button"]').first();

    await Promise.race([
      emptyState.waitFor({ state: 'visible', timeout: 15_000 }).catch(() => {}),
      linkCard.waitFor({ state: 'visible', timeout: 15_000 }).catch(() => {}),
      buttonCard.waitFor({ state: 'visible', timeout: 15_000 }).catch(() => {}),
    ]);

    if (await linkCard.isVisible().catch(() => false)) {
      await linkCard.click();
      return true;
    }
    if (await buttonCard.isVisible().catch(() => false)) {
      await buttonCard.click();
      return true;
    }
    return false;
  }

  test('navega de /projects a un detalle', async ({ page }) => {
    const opened = await openFirstProject(page);
    if (!opened) {
      // Usuario sin proyectos: estado válido. Confirmamos empty state y salimos.
      await expect(page.getByText(/sin proyectos para mostrar/i)).toBeVisible();
      return;
    }
    await page.waitForURL(/\/projects\/\d+/, { timeout: 15_000 });
    await expect(page).toHaveURL(/\/projects\/\d+/);
  });

  test('breadcrumb del detalle incluye "Proyectos"', async ({ page }) => {
    const opened = await openFirstProject(page);
    if (!opened) {
      await expect(page.getByText(/sin proyectos para mostrar/i)).toBeVisible();
      return;
    }
    await page.waitForURL(/\/projects\/\d+/, { timeout: 15_000 });
    await expect(page.locator('nav[aria-label="Breadcrumb"]').getByText(/proyectos/i)).toBeVisible();
  });
});
