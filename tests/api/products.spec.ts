import { test, expect } from '@fixtures/apiClients.fixture';
import { validateSchema } from '@helpers/schemaValidator';
import { productsResponseSchema } from '@schemas/productSchemas';

test.describe('@api Products — /product', () => {
  test('@smoke returns the products catalog with sale flag', async ({ apiClients }) => {
    const body = await apiClients.product.getProducts();

    validateSchema(body, productsResponseSchema, 'GET /product');
    expect(body.products.length).toBeGreaterThan(0);
    expect(body.sale).toBeGreaterThanOrEqual(0);
    expect(body.sale).toBeLessThanOrEqual(1);
  });

  test('every product exposes a stable identity and a non-empty name', async ({ apiClients }) => {
    const { products } = await apiClients.product.getProducts();

    for (const product of products) {
      expect(product.id, `product missing id: ${JSON.stringify(product)}`).toBeTruthy();
      expect(product.name, `product missing name: ${JSON.stringify(product)}`).toBeTruthy();
    }

    const ids = products.map((p) => p.id);
    expect(new Set(ids).size, 'duplicate product ids in catalog').toBe(ids.length);
  });

  test('isOutOfStock matches stockQuantity === 0', async ({ apiClients }) => {
    const { products } = await apiClients.product.getProducts();

    for (const p of products) {
      expect(
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
