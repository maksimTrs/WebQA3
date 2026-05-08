import { expect, type APIResponse } from '@playwright/test';
import type { BaseApi } from '@helpers/baseApi';
import type { ProductsResponse } from '@models/product';

export class ProductApi {
  constructor(private readonly http: BaseApi) {}

  getProductsResponse(): Promise<APIResponse> {
    return this.http.get('/product/', { tag: 'getProducts' });
  }

  async getProducts(): Promise<ProductsResponse> {
    const r = await this.getProductsResponse();
    expect(r.status(), 'GET /product').toBe(200);
    return r.json();
  }
}
