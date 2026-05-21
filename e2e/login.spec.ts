import { test, expect } from '@playwright/test';

test.describe('Login', () => {
  test('renderiza el formulario', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /iniciar sesi[oó]n/i })).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.getByRole('button', { name: /iniciar sesi[oó]n/i })).toBeVisible();
  });

  test('toggle mostrar/ocultar contraseña', async ({ page }) => {
    await page.goto('/login');
    const pwd = page.locator('input[type="password"]');
    await pwd.fill('algo');
    await page.getByRole('button', { name: /mostrar contrase/i }).click();
    await expect(page.locator('input[type="text"][placeholder="••••••••"]')).toBeVisible();
  });

  test('campos vacíos → toast de error', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: /iniciar sesi[oó]n/i }).click();
    await expect(page.getByText(/completa todos los campos/i)).toBeVisible();
  });

  test('credenciales inválidas → mensaje de error', async ({ page }) => {
    await page.goto('/login');
    await page.locator('input[type="email"]').fill('no-existe@example.com');
    await page.locator('input[type="password"]').fill('passwordIncorrecta!');
    await page.getByRole('button', { name: /iniciar sesi[oó]n/i }).click();
    await expect(page.getByText(/correo o contrase[ñn]a incorrectos/i)).toBeVisible({ timeout: 15_000 });
    await expect(page).toHaveURL(/\/login/);
  });

  test('login exitoso redirige a /dashboard', async ({ page }) => {
    const email = process.env.TEST_EMAIL!;
    const password = process.env.TEST_PASSWORD!;
    await page.goto('/login');
    await page.locator('input[type="email"]').fill(email);
    await page.locator('input[type="password"]').fill(password);
    await page.getByRole('button', { name: /iniciar sesi[oó]n/i }).click();
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 30_000 });
  });

  test('link "Volver al inicio" regresa a landing', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('link', { name: /volver al inicio/i }).click();
    await expect(page).toHaveURL(/\/$/);
  });
});
