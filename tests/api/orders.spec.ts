import { test, expect } from '@fixtures/apiClients.fixture';
import { validateSchema } from '@helpers/schemaValidator';
import { createCardDetails } from '@data/cardFactory';
import { createAndPayResponseSchema } from '@schemas/orderSchemas';
import { testUser } from '@data/testUser';

test.describe('Orders — /order/createAndPay', { tag: '@api' }, () => {
  test('purchases a single in-stock product', { tag: '@smoke' }, async ({ apiClients }) => {
    const inStock = await test.step('Find an in-stock product', async () => {
      const { products } = await apiClients.product.getProducts();
      const product = products.find((p) => !p.isOutOfStock && p.stockQuantity > 0);
      expect(product, 'No in-stock product available — cannot exercise /order/createAndPay').toBeDefined();
      return product!;
    });

    const body = await test.step('Place order via /order/createAndPay', async () => {
      return apiClients.order.createAndPay({
        card: createCardDetails(),
        products: [{ id: inStock.id, quantity: 1 }],
      });
    });

    await test.step('Verify response shape and contents', async () => {
      validateSchema(body, createAndPayResponseSchema, 'createAndPay response');

      const { transaction } = body;
      expect(transaction.order.status).toBe('paid');
      expect(transaction.order.user.email).toBe(testUser.email);
      expect(transaction.order.totalQuantity).toBe(1);
      expect(transaction.order.products).toHaveLength(1);
      expect(transaction.order.products[0]!.product.id).toBe(inStock.id);
      expect(transaction.order.products[0]!.quantity).toBe(1);
    });
  });

  test('rejects out-of-stock product with 4xx', async ({ apiClients }) => {
    const { products } = await apiClients.product.getProducts();
    const outOfStock = products.find((p) => p.isOutOfStock);
    // eslint-disable-next-line playwright/no-skipped-test
    test.skip(!outOfStock, 'No out-of-stock product available for negative test');

    const response = await apiClients.order.createAndPayResponse({
      card: createCardDetails(),
      products: [{ id: outOfStock!.id, quantity: 1 }],
    });

    await expect(response).not.toBeOK();
  });

  test('rejects unauthenticated request with 401', async ({ anonClients }) => {
    // Arbitrary product id — the server rejects on auth before it ever
    // looks at the cart, so the value is irrelevant to the assertion.
    const response = await anonClients.order.createAndPayResponse({
      card: createCardDetails(),
      products: [{ id: 'any', quantity: 1 }],
    });
    expect(response.status()).toBe(401);
  });
});
