import type { FromSchema } from 'json-schema-to-ts';
import type { createAndPayResponseSchema } from '@schemas/orderSchemas';
import type { CardDetails } from '@models/card';

// Response shape derived from the AJV schema.
export type CreateAndPayResponse = FromSchema<typeof createAndPayResponseSchema>;

// Request payload — hand-written from the API contract.
export interface OrderItem {
  id: string;
  quantity: number;
}

export interface CreateAndPayPayload {
  card: CardDetails;
  products: OrderItem[];
}
