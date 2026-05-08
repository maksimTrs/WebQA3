import { expect, type APIResponse } from '@playwright/test';
import type { BaseApi } from '@helpers/baseApi';
import type { CreateAndPayPayload, CreateAndPayResponse } from '@models/order';

export class OrderApi {
  constructor(private readonly http: BaseApi) {}

  createAndPayResponse(payload: CreateAndPayPayload): Promise<APIResponse> {
    return this.http.post('/order/createAndPay', { json: payload, tag: 'createAndPay' });
  }

  async createAndPay(payload: CreateAndPayPayload): Promise<CreateAndPayResponse> {
    const r = await this.createAndPayResponse(payload);
    expect(r.status(), 'POST /order/createAndPay').toBe(200);
    return r.json();
  }
}
