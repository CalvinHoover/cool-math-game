import { test, expect } from '@playwright/test';

test.describe('login → practice → profile → logout journey', () => {
  const username = `e2e_practice_${Date.now()}`;
  const email = `${username}@example.com`;
  const password = 'password123';

  test.beforeAll(async ({ request }) => {
    const res = await request.post('/api/auth/register', {
      data: { username, email, password },
    });
    expect(res.ok()).toBe(true);
  });

  // [GenAI Use] Prompt: "Use previous context and uploaded files about my project. I have attached the auth.spec.ts signup e2e test as an example. Write a playwright e2e test that covers login, practice session flow, profile inspection, and logout. Use the project's page selectors and realistic seeded data."
  // [GenAI Use] LLM Response Start
  test('full user journey', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[placeholder="Email"]', email);
    await page.fill('input[placeholder="Password"]', password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/);

    await page.goto('/practice');
    await page.waitForSelector('select');
    await page.selectOption('select', { label: 'Algebra' });
    await page.click('button:has-text("Start Session")');

    await page.waitForURL(/\/practice\?topicId=/);
    await page.waitForSelector('input[type="text"]');

    let nextButton = page.locator('button:has-text("Next Question"), button:has-text("View Score")');
    while (!(await nextButton.isVisible().catch(() => false))) {
      await page.fill('input[type="text"]', '2');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(500);
      nextButton = page.locator('button:has-text("Next Question"), button:has-text("View Score")');
    }

    await nextButton.click();
    await page.waitForURL(/\/practice\?topicId=/);
    await page.waitForSelector('text=Session Complete!');

    await page.click('a:has-text("Play Again")');
    await page.waitForURL(/\/practice$/);

    await page.goto('/profile');
    await page.waitForSelector('text=Player Profile');
    await expect(page.locator('text=Player Profile')).toBeVisible();

    await page.goto('/dashboard');
    await page.waitForURL(/\/dashboard/);

    await page.click('.btn-logout');
    await page.waitForURL(/\/login/);
    await expect(page).toHaveURL(/\/login$/);
  });
  // [GenAI Use] LLM Response End
  // [GenAI Use] Reflection: I've been thinking through the test and believe it is correct and exactly what I need. I updated some selector patterns to match the project's naming conventions (using placeholder attributes and CSS classes like .btn-logout) and added explicit waitForURL calls to handle the Next.js router transitions reliably.
});
