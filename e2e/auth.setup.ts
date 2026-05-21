import { test as setup, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const authFile = path.join(__dirname, '.auth', 'user.json');

setup('authenticate', async ({ page }) => {
  const email = process.env.TEST_EMAIL;
  const password = process.env.TEST_PASSWORD;

  if (!email || !password) {
    throw new Error('Faltan TEST_EMAIL / TEST_PASSWORD en .env.test');
  }

  await page.goto('/login');

  // Email + password inputs (no data-testid, así que usamos type/placeholder)
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(password);

  await page.getByRole('button', { name: /iniciar sesi[oó]n/i }).click();

  // Espera a la redirección al dashboard
  await page.waitForURL(/\/dashboard/, { timeout: 30_000 });
  await expect(page).toHaveURL(/\/dashboard/);

  // Confirma que la sesión está hidratada en localStorage
  await page.waitForFunction(
    () => !!localStorage.getItem('pip_user'),
    null,
    { timeout: 10_000 }
  );

  fs.mkdirSync(path.dirname(authFile), { recursive: true });
  await page.context().storageState({ path: authFile });
});
