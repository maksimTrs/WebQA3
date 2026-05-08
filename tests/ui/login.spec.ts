import { test, expect } from '@fixtures/uiPages.fixture';
import { testUser } from '@data/testUser';

test.describe('Login', { tag: '@ui' }, () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('logs in with valid credentials and lands on dashboard', { tag: '@smoke' }, async ({
    page,
    loginPage,
    productsPage,
  }) => {
    await loginPage.login(testUser.email, testUser.password);

    await expect(page).toHaveURL((url) => url.pathname === '/');
    await expect(productsPage.welcomeHeading).toContainText(testUser.email);
    await expect(productsPage.userMenuButton).toBeVisible();
  });

  test('shows inline error for invalid email format', async ({ loginPage }) => {
    await loginPage.emailInput.fill('not-an-email');
    await loginPage.passwordInput.fill('any-password');
    await loginPage.passwordInput.press('Tab');

    await expect(loginPage.validationMessage('Invalid email address')).toBeVisible();
    await expect(loginPage.submitButton).toBeDisabled();
  });

  test('keeps Login button disabled while form is empty', async ({ loginPage }) => {
    await expect(loginPage.submitButton).toBeDisabled();
  });

  test('shows server-side alert when password is wrong', async ({ loginPage }) => {
    await loginPage.enterCredentials(testUser.email, 'definitely-wrong');
    const alertText = await loginPage.submitExpectingAlert();
    expect(alertText).toBe('Error:formLogin Wrong credentials');
  });

  test('shows server-side alert when email is unknown', async ({ loginPage }) => {
    await loginPage.enterCredentials(`unknown_${Date.now()}@nowhere.test`, 'whatever');
    const alertText = await loginPage.submitExpectingAlert();
    expect(alertText).toMatch(/Error:formLogin/);
  });
});
