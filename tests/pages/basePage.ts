import type { Locator, Page } from '@playwright/test';
import { waitForAlert } from '@helpers/dialogHandler';

export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  /**
   * Click a submit-style locator and wait for the resulting `window.alert()`.
   * PayForm uses native alerts for both errors and success notifications;
   * tests need to arm the listener BEFORE triggering the click, which this
   * helper does in the right order.
   */
  protected async clickAndAwaitAlert(
    button: Locator,
    timeoutMs = 5_000,
  ): Promise<string> {
    const alertPromise = waitForAlert(this.page, timeoutMs);
    await button.click();
    return alertPromise;
  }
}

/**
 * Pages reachable by direct URL extend this. Pages reached only by flow
 * (modals, post-action screens like checkout) extend `BasePage` directly.
 */
export abstract class NavigablePage extends BasePage {
  protected abstract get path(): string;

  async goto(): Promise<void> {
    await this.page.goto(this.path);
  }
}
