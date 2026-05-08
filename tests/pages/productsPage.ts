import type { Locator, Page } from '@playwright/test';
import { NavigablePage } from '@pages/basePage';

export class ProductsPage extends NavigablePage {
  readonly welcomeHeading: Locator;
  readonly userMenuButton: Locator;
  readonly cartTotalHeading: Locator;
  readonly cartTable: Locator;

  constructor(page: Page) {
    super(page);
    this.welcomeHeading = page.getByRole('heading', { name: /Welcome!/ });
    this.userMenuButton = page.getByRole('button', { name: 'account of current user' });
    this.cartTotalHeading = page.getByRole('heading', { name: /Total: \d/ });
    this.cartTable = page.getByRole('table');
  }

  protected get path(): string {
    return '/';
  }

  /** Card root for a product, found by its visible name. */
  productCard(name: string): Locator {
    // FAILURE POINT: this XPath couples to MUI's internal `MuiPaper-root`
    // class. A MUI major-version upgrade can rename or restructure that
    // class, which breaks all `productCard()` callers. The product cards
    // expose no semantic landmark (no role, no data-testid), so this is
    // the only stable anchor available — revisit if a `data-testid` lands
    // on the upstream component.
    return this.page
      .getByRole('heading', { name, exact: true, level: 5 })
      .locator('xpath=ancestor::*[contains(@class,"MuiPaper-root")][1]');
  }

  async addToCart(productName: string): Promise<void> {
    await this.productCard(productName).getByRole('button', { name: 'Add to chart' }).click();
  }

  cartQuantityInput(productName: string): Locator {
    // Pass plain string (substring match) rather than `new RegExp(productName)` —
    // real product names contain regex metachars like `.`, `(`, `+`.
    return this.cartTable
      .getByRole('row', { name: productName })
      .getByRole('textbox');
  }

  async setQuantity(productName: string, quantity: number): Promise<void> {
    await this.cartQuantityInput(productName).fill(String(quantity));
  }

  async expectInCart(productName: string): Promise<void> {
    await this.cartTable.getByRole('row', { name: productName }).waitFor();
  }
}
