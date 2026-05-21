import { test, expect } from '@playwright/test';

test.describe('Navegación general autenticada', () => {
  test('sidebar navega a todas las páginas principales visibles', async ({ page }) => {
    await page.goto('/dashboard');

    const items: Array<{ name: string; url: RegExp }> = [
      { name: 'Backlog', url: /\/backlog/ },
      { name: 'Proyectos', url: /\/projects/ },
      { name: 'Dashboard', url: /\/dashboard/ },
    ];

    for (const item of items) {
      const link = page.getByRole('link', { name: item.name, exact: true });
      if (!(await link.first().isVisible().catch(() => false))) continue;
      await link.first().click();
      await expect(page).toHaveURL(item.url);
    }
  });

  test('logout desde menú de usuario cierra sesión', async ({ page }) => {
    await page.goto('/dashboard');
    await page.getByRole('button', { name: /men[uú] de usuario/i }).click();
    await page.getByRole('button', { name: /cerrar sesi[oó]n/i }).click();
    // Tras logout, AppLayout redirige a / (landing). Validamos salida del área autenticada.
    await expect(page).toHaveURL(/^https?:\/\/[^/]+\/?(login)?$/, { timeout: 15_000 });
    // localStorage no debe seguir teniendo la sesión
    const stored = await page.evaluate(() => localStorage.getItem('pip_user'));
    expect(stored).toBeNull();
  });

  test('ruta inexistente muestra NotFound', async ({ page }) => {
    await page.goto('/esta-ruta-no-existe-123');
    // NotFound suele tener "404" o un mensaje. Validamos que no estamos en una página app real.
    await expect(page.locator('body')).toContainText(/404|no encontrad[ao]|not found/i);
  });
});
