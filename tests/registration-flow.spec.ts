import { expect, Page, test } from '@playwright/test'
import { faker } from '@faker-js/faker';

test.use({
    httpCredentials: {
      username: 'getin-qa',
      password: 'fUQRV.hL*6Ra@Kj4mWkQivoe',
    },
  });

test.beforeEach(async ({ page }) => {
    await page.goto('/')
});

test.describe('Registration flow => ', () => {

  test('User is able to register from home page', async({ page }) => {
    await page.locator('.header-user-menu').click()
    await page.getByText('Email').click()
    await page.getByRole('textbox', { name: 'Email Address' }).fill(faker.internet.email())
    await page.locator('#otp_btn').click()

    const response = await page.waitForResponse(res =>
        res.url().includes('/api/user-auth/check/V2') &&
        res.request().method() === 'POST'
      );
    const data = await response.json();

    await expect(page.getByText('OTP Verification')).toBeVisible()
    await page.getByRole('textbox', { name: 'XXXXXX' }).fill(data.original.token)

    await page.getByRole('textbox', { name: 'First name' }).fill(faker.person.firstName())
    await page.getByRole('textbox', { name: 'Last name' }).fill(faker.person.lastName())
    await page.selectOption('#gender', { label: 'Male' });
    await page.locator('.mat-mdc-button-touch-target').nth(1).click()
    await page.getByRole('button', { name: 'December 8,' }).click()
    await page.getByRole('button', { name: 'finish' }).click()

    await expect(page.getByText('Welcome, loading home page')).toBeVisible()
  })

  test('User is able to register from event page', async({ page }) => {
    await page.goto('/en/8929?seller_code=getin')

    if (await page.getByText('Allow all cookies').isVisible()) {
      await page.getByText('Allow all cookies').click();
    }
    await page.locator('#orderticket').click()
    await page.locator('.ticket-btn').first().click()
    await page.getByText('Continue').click()
    await page.getByText('Login with email').click()
    await page.getByPlaceholder('email').fill(faker.internet.email())
    await page.locator('#continuebtn').click()

    const response = await page.waitForResponse(res =>
      res.url().includes('/api/user-auth/check/V2') &&
      res.request().method() === 'POST'
    );
    const data = await response.json();

    await page.getByPlaceholder('XXXXXX').fill(data.original.token)

    await expect(page.getByText('Welcome to Getin')).toBeVisible()

    await page.getByRole('textbox', { name: 'Your name' }).fill(`${faker.person.firstName()} ${faker.person.lastName()}`)
    await page.locator('input[name="dob"]').fill('2007-05-17');
    await page.getByRole('button', {name: 'Continue'}).click()

    await expect(page.getByText('Order Summary')).toBeVisible()
  })
})