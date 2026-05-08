import { test, expect } from '@fixtures/uiPages.fixture';
import { createCardDetails } from '@data/cardFactory';

test.describe('Purchase', { tag: '@ui' }, () => {
  test('adds an in-stock product to cart and completes payment', { tag: '@smoke' }, async ({
    apiClients,
    loggedInUser,
    productsPage,
    checkoutPage,
  }) => {
    // Pick a fresh in-stock product via API rather than hard-coding a name —
    // the catalog is shared across runs, so a fixed pick goes out of stock
    // quickly and turns this smoke test into a flake.
    const productName = await test.step('Select an in-stock product via API', async () => {
      const { products } = await apiClients.product.getProducts();
      const inStock = products.find((p) => !p.isOutOfStock && p.stockQuantity > 0);
      expect(inStock, 'No in-stock product available').toBeDefined();
      return inStock!.name;
    });

    await test.step('Open products page (auth seeded via fixture)', async () => {
      await productsPage.goto();
      // Verifies the localStorage seed was picked up: the welcome heading
      // renders only after the app accepts the token. If seeding fails,
      // this assertion fails with a clear message instead of a downstream
      // "cart row not found" error.
      await expect(productsPage.welcomeHeading).toContainText(loggedInUser.email);
    });

    await test.step(`Add "${productName}" to cart with quantity 1`, async () => {
      await productsPage.addToCart(productName);
      await productsPage.expectInCart(productName);
      // Defensive: force quantity to 1 explicitly. The "Add to chart" click
      // sometimes lands a row with quantity=0 under parallel load, which
      // keeps the Complete button disabled (qty>0 is the gate condition).
      await productsPage.setQuantity(productName, 1);
      await expect(productsPage.cartQuantityInput(productName)).toHaveValue('1');
    });

    await test.step('Fill card form and accept terms', async () => {
      await checkoutPage.fillCard(createCardDetails());
      await checkoutPage.acceptTerms();
      await expect(checkoutPage.completeButton).toBeEnabled();
    });

    await test.step('Submit and observe success alert', async () => {
      const alertText = await checkoutPage.submitExpectingAlert();
      expect(alertText).toMatch(/Purchase of .* completed successfully/);
    });
  });
});
