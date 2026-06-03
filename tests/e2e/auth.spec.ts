import { test, expect } from '@playwright/test';

test('signup flow creates a user and lands on the dashboard', async ({ page }) => {
  const username = `e2e_user_${Date.now()}`;
  const email = `${username}@example.com`;
  const password = 'password123';

  await page.goto('/signup');
  await expect(page).toHaveURL(/\/signup$/);

  await page.fill('input[placeholder="Username"]', username);
  await page.fill('input[placeholder="Email"]', email);
  await page.fill('input[placeholder="Password"]', password);

  await page.click('button[type="submit"]');

  await page.waitForURL(/\/dashboard/);
  await expect(page).toHaveURL(/\/dashboard$/);

  const welcome = page.locator('.welcome-msg');
  await expect(welcome).toContainText(username);
});
