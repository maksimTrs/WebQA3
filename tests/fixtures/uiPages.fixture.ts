import { mergeTests, test as base } from '@playwright/test';
import { test as apiTest } from '@fixtures/apiClients.fixture';
import { SignupPage } from '@pages/signupPage';
import { LoginPage } from '@pages/loginPage';
import { ProductsPage } from '@pages/productsPage';
import { CheckoutPage } from '@pages/checkoutPage';

interface UiFixtures {
  signupPage: SignupPage;
  loginPage: LoginPage;
  productsPage: ProductsPage;
  checkoutPage: CheckoutPage;
}

const uiTest = base.extend<UiFixtures>({
  signupPage: async ({ page }, use) => use(new SignupPage(page)),
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  productsPage: async ({ page }, use) => use(new ProductsPage(page)),
  checkoutPage: async ({ page }, use) => use(new CheckoutPage(page)),
});

// Merged so UI tests can also reach API clients (e.g. picking an in-stock
// product before driving the UI checkout).
export const test = mergeTests(uiTest, apiTest);
export { expect } from '@playwright/test';
