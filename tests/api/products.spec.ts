import { test, expect } from '@fixtures/apiClients.fixture';
import { validateSchema } from '@helpers/schemaValidator';
import { productsResponseSchema } from '@schemas/productSchemas';

test.describe('Products — /product', { tag: '@api' }, () => {
  test('returns the products catalog with sale flag', { tag: '@smoke' }, async ({ apiClients }) => {
    const body = await apiClients.product.getProducts();

    validateSchema(body, productsResponseSchema, 'GET /product');
    expect(body.products.length).toBeGreaterThan(0);
    expect(body.sale).toBeGreaterThanOrEqual(0);
    expect(body.sale).toBeLessThanOrEqual(1);
  });

  test('every product exposes a stable identity and a non-empty name', async ({ apiClients }) => {
    const { products } = await apiClients.product.getProducts();

    // Soft assertions per item — one bad product no longer hides the rest.
    // The test still hard-fails at the end via Playwright's accumulated
    // soft-error tracking.
    for (const product of products) {
      expect.soft(product.id, `product missing id: ${JSON.stringify(product)}`).toBeTruthy();
      expect.soft(product.name, `product missing name: ${JSON.stringify(product)}`).toBeTruthy();
    }

    const ids = products.map((p) => p.id);
    expect(new Set(ids).size, 'duplicate product ids in catalog').toBe(ids.length);
  });

  test('isOutOfStock matches stockQuantity === 0', async ({ apiClients }) => {
    const { products } = await apiClients.product.getProducts();

    // Soft so a single inconsistent product surfaces every other mismatch
    // in the same run instead of failing on the first one.
    for (const p of products) {
      expect.soft(
        p.isOutOfStock,
        `Inconsistent stock for "${p.name}" (id=${p.id}): stockQuantity=${p.stockQuantity}, isOutOfStock=${p.isOutOfStock}`,
      ).toBe(p.stockQuantity === 0);
    }
  });

  test('rejects unauthenticated request with 401', async ({ anonClients }) => {
    const response = await anonClients.product.getProductsResponse();
    expect(response.status()).toBe(401);
  });
});
