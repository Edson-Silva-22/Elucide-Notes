import { test, expect } from '@playwright/test';

test('Deve ser possível resgistrar um novo usuário', async ({ page }) => {
  await page.goto('/register')
})