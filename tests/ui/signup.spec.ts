import { test, expect } from '@fixtures/uiPages.fixture';
import { createSignupPayload } from '@data/userFactory';
import { testUser } from '@data/testUser';

test.describe('@ui Signup', () => {
  test.beforeEach(async ({ signupPage }) => {
    await signupPage.goto();
  });

  test('@smoke registers a fresh user and shows the success alert', async ({ page, signupPage }) => {
    const payload = createSignupPayload();

    const alertText = await signupPage.signupExpectingAlert(
      payload.email,
      payload.password,
      payload.passwordConfirm,
    );

    expect(alertText).toBe('You have successfully registered');
    // App auto-redirects to /login after success — assert the URL changed.
    await expect(page).toHaveURL(/\/login$/);
  });

  test('shows inline error for invalid email format', async ({ signupPage }) => {
    await signupPage.emailInput.fill('not-an-email');
    await signupPage.passwordInput.fill('valid-pwd');
    await signupPage.confirmPasswordInput.fill('valid-pwd');
    // Force blur — Material UI surfaces validation on blur, not on input.
    await signupPage.confirmPasswordInput.press('Tab');

    await expect(signupPage.validationMessage('Invalid email address')).toBeVisible();
    await expect(signupPage.submitButton).toBeDisabled();
  });

  test('shows inline error when passwords do not match', async ({ signupPage }) => {
    await signupPage.enterCredentials('user@mail.com', '123456', '654321');
    await signupPage.confirmPasswordInput.press('Tab');

    await expect(signupPage.validationMessage('Passwords do not match')).toBeVisible();
    await expect(signupPage.submitButton).toBeDisabled();
  });

  test('keeps Signup button disabled while form is empty', async ({ signupPage }) => {
    await expect(signupPage.submitButton).toBeDisabled();
  });

  test('shows server-side error alert when email already exists', async ({ signupPage }) => {
    const alertText = await signupPage.signupExpectingAlert(
      testUser.email,
      testUser.password,
      testUser.password,
    );

    expect(alertText).toContain('Error:formSignup');
    expect(alertText).toMatch(/duplicate|unique/i);
  });
});
