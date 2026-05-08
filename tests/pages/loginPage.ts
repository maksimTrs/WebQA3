import type { Locator, Page } from '@playwright/test';
import { NavigablePage } from '@pages/basePage';

export class LoginPage extends NavigablePage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = page.getByRole('textbox', { name: 'Email Address *' });
    this.passwordInput = page.getByRole('textbox', { name: 'Password *', exact: true });
    // Header has a "Login" link with role=button — disambiguate via type=submit.
    this.submitButton = page.locator('button[type="submit"]');
  }

  protected get path(): string {
    return '/login';
  }

  async enterCredentials(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
  }

  async login(email: string, password: string): Promise<void> {
    await this.enterCredentials(email, password);
    await this.submitButton.click();
    await this.page.waitForURL((url) => url.pathname === '/', { timeout: 15_000 });
    await this.page.getByRole('heading', { name: /Welcome!/ }).waitFor();
  }

  submitExpectingAlert(): Promise<string> {
    return this.clickAndAwaitAlert(this.submitButton);
  }

  validationMessage(text: string): Locator {
    return this.page.getByText(text, { exact: true });
  }
}
