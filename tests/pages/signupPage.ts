import type { Locator, Page } from '@playwright/test';
import { NavigablePage } from '@pages/basePage';

export class SignupPage extends NavigablePage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = page.getByRole('textbox', { name: 'Email Address *' });
    this.passwordInput = page.getByRole('textbox', { name: 'Password *', exact: true });
    this.confirmPasswordInput = page.getByRole('textbox', { name: 'Confirm password *' });
    // Header has a "Signup" link with role=button — disambiguate via type=submit.
    this.submitButton = page.locator('button[type="submit"]');
  }

  protected get path(): string {
    return '/signup';
  }

  async enterCredentials(
    email: string, password: string, passwordConfirm: string,
  ): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.confirmPasswordInput.fill(passwordConfirm);
  }

  submitExpectingAlert(): Promise<string> {
    return this.clickAndAwaitAlert(this.submitButton);
  }

  async signupExpectingAlert(
    email: string, password: string, passwordConfirm: string,
  ): Promise<string> {
    await this.enterCredentials(email, password, passwordConfirm);
    return this.submitExpectingAlert();
  }

  validationMessage(text: string): Locator {
    return this.page.getByText(text, { exact: true });
  }
}
