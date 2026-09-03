import { test, expect } from '@playwright/test';

test('App boots and renders title', async ({ page }) => {
  await page.goto('/');
  const title = page.locator('h1');
  await expect(title).toBeVisible();
  await expect(title).toContainText('CYBER-IMMUNOLOGY');
  await expect(page.locator('[data-testid="btn-menu-start"]')).toBeVisible();
});
