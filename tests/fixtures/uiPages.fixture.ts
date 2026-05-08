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

interface AuthFixtures {
  loggedInUser: { email: string };
}

const uiTest = base.extend<UiFixtures>({
  signupPage: async ({ page }, use) => use(new SignupPage(page)),
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  productsPage: async ({ page }, use) => use(new ProductsPage(page)),
  checkoutPage: async ({ page }, use) => use(new CheckoutPage(page)),
});

// Merged so UI tests can also reach API clients (e.g. picking an in-stock
// product before driving the UI checkout) and reuse the worker auth session.
const merged = mergeTests(uiTest, apiTest);

// Test-scoped auth seed: take the worker JWT (issued once by `authSession`)
// and inject it into localStorage BEFORE any app script runs. PayForm reads
// `authToken` from localStorage on bootstrap, so the first navigation lands
// already authenticated — no UI login flow needed in non-login specs.
//
// Caveat: `addInitScript` re-runs on every navigation, so any flow that
// asserts logout (clears localStorage and expects a redirect to /login)
// cannot use this fixture — those tests must drive the real login UI.
export const test = merged.extend<AuthFixtures>({
  loggedInUser: async ({ page, authSession }, use) => {
    await page.addInitScript((token) => {
      try {
        window.localStorage.setItem('authToken', token);
      } catch {
        // localStorage is unavailable on about:blank / sandboxed iframes;
        // the script re-fires on the next real navigation, which is fine.
      }
    }, authSession.authToken);
    await use({ email: authSession.email });
  },
});

export { expect } from '@playwright/test';
