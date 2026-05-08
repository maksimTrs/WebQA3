import { test, expect } from '@fixtures/uiPages.fixture';
import { testUser } from '@data/testUser';
import { createCardDetails } from '@data/cardFactory';

test.describe('@ui Purchase', () => {
  test('@smoke logs in, adds an in-stock product to cart, completes payment', async ({
    apiClients,
    loginPage,
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

    await test.step('Log in via UI', async () => {
      await loginPage.goto();
      await loginPage.login(testUser.email, testUser.password);
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
