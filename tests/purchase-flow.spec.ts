import { test, expect } from '@playwright/test';
import { faker } from "@faker-js/faker";

test.use({
    httpCredentials: {
      username: 'getin-qa',
      password: 'fUQRV.hL*6Ra@Kj4mWkQivoe',
    },
  });

test.beforeEach(async ({ page }) => {
    await page.goto('/')
});

test('should purchase ticket successesfull', async ({ page }) => {
  await page.goto('/en/8929?seller_code=getin')
  await page.getByText('Order ticket').click();
  await page.locator('.ticket-btn').first().click();
  await page.locator('div').filter({ hasText: /^continue$/ }).click();
  await page.getByText('Login with email').click()
  await page.getByPlaceholder('email').fill('vikvolsen@gmail.com')
  await page.locator('#continuebtn').click()

  const response = await page.waitForResponse(res =>
    res.url().includes('/api/user-auth/check/V2') &&
    res.request().method() === 'POST'
  );
  const data = await response.json();

  await page.getByPlaceholder('XXXXXX').fill(data.original.token)
  await page.locator('.checkmark').first().click();
  await page.getByText('Continue1 ticket$').click();
  const frameLocator = page.frameLocator('iframe[name^="__privateStripeFrame"]'); // або конкретний селектор
  const cardNumberFrame = frameLocator.first();

  // Введення номеру картки
  await cardNumberFrame.locator('input[name="cardnumber"]').fill('4242 4242 4242 4242');
  await cardNumberFrame.locator('input[name="exp-date"]').fill('12 / 34');
  await cardNumberFrame.locator('input[name="cvc"]').fill('123');
  await cardNumberFrame.locator('input[name="postal"]').fill('555555');
  await page.getByText('Continue1 ticket$').click();
  await expect(page.getByText('🎉 Woohoo!')).toBeVisible();
  await expect(page.getByText('🎟️ Your Ticket is Locked In!')).toBeVisible();
  await page.getByRole('button', { name: 'View Your Ticket' }).click();

  if (await page.locator('app-try-beta-modal').getByRole('img').isVisible()) {
    await page.locator('app-try-beta-modal').getByRole('img').click()
  }

  await page.getByRole('button', { name: 'View Ticket' }).first().click();
  await expect(page.locator('qrcode canvas')).toBeVisible
});