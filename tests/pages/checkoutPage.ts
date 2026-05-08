import { expect, type Locator, type Page } from '@playwright/test';
import type { CardDetails } from '@models/card';
import { BasePage } from '@pages/basePage';

export class CheckoutPage extends BasePage {
  readonly cardNumberInputs: Locator[];
  readonly monthInput: Locator;
  readonly yearInput: Locator;
  readonly nameInput: Locator;
  readonly cvvInput: Locator;
  readonly agreeCheckbox: Locator;
  readonly completeButton: Locator;

  constructor(page: Page) {
    super(page);
    this.cardNumberInputs = [1, 2, 3, 4].map((i) =>
      page.locator(`input[name="card-input-number-${i}"]`),
    );
    this.monthInput = page.locator('input[name="card-input-date-1"]');
    this.yearInput = page.locator('input[name="card-input-date-2"]');
    this.nameInput = page.locator('input[name="card-input-name"]');
    this.cvvInput = page.locator('input[name="card-input-cvv"]');
    this.agreeCheckbox = page.locator('input[name="isAgreeWithRules"]');
    this.completeButton = page.getByRole('button', { name: 'Complete', exact: true });
  }

  async fillCard(card: CardDetails): Promise<void> {
    const digits = card.number.replace(/\s+/g, '');
    if (digits.length !== 16) {
      throw new Error(`Card number must be 16 digits, got ${digits.length}`);
    }

    // Real-keyboard fills race MUI's auto-advance under parallel load and
    // drop chars at box boundaries. Setting value via the native React-aware
    // setter + bubbling `input` event is the canonical workaround.
    await this.setReactInput(this.cardNumberInputs, [
      digits.slice(0, 4), digits.slice(4, 8), digits.slice(8, 12), digits.slice(12, 16),
    ]);

    for (let i = 0; i < 4; i++) {
      const input = this.cardNumberInputs[i];
      if (!input) continue;
      await expect(input).toHaveValue(digits.slice(i * 4, (i + 1) * 4), { timeout: 5_000 });
    }

    const [month, year] = card.date.split(':');
    if (!month || !year) {
      throw new Error(`Card date must be "M:YY" or "MM:YY", got ${card.date}`);
    }
    await this.setReactInput(
      [this.monthInput, this.yearInput, this.nameInput, this.cvvInput],
      [month, year, card.name, card.cvv],
    );
  }

  async acceptTerms(): Promise<void> {
    await this.agreeCheckbox.check();
  }

  submitExpectingAlert(): Promise<string> {
    return this.clickAndAwaitAlert(this.completeButton, 15_000);
  }

  private async setReactInput(locators: Locator[], values: string[]): Promise<void> {
    for (let i = 0; i < locators.length; i++) {
      const locator = locators[i];
      const value = values[i];
      if (!locator || value === undefined) continue;
      await locator.evaluate((el, val) => {
        const input = el as HTMLInputElement;
        const setter = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype, 'value',
        )?.set;
        setter?.call(input, val);
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }, value);
    }
  }
}
