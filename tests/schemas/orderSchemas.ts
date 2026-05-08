import type { JSONSchema } from 'json-schema-to-ts';
import { productSchema } from '@schemas/productSchemas';
import { userProfileSchema } from '@schemas/userSchemas';

const orderProductLineSchema = {
  type: 'object',
  properties: {
    product: productSchema,
    quantity: { type: 'integer', minimum: 1 },
  },
  required: ['product', 'quantity'],
  additionalProperties: false,
} as const satisfies JSONSchema;

const orderSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', minLength: 1 },
    user: userProfileSchema,
    products: { type: 'array', items: orderProductLineSchema, minItems: 1 },
    totalQuantity: { type: 'integer', minimum: 1 },
    status: { type: 'string', minLength: 1 },
    totalSum: { type: 'number', minimum: 0 },
    createdAt: { type: 'string', format: 'date-time' },
  },
  required: [
    'id', 'user', 'products', 'totalQuantity',
    'status', 'totalSum', 'createdAt',
  ],
  additionalProperties: false,
} as const satisfies JSONSchema;

const transactionSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    order: orderSchema,
  },
  required: ['id', 'order'],
  additionalProperties: false,
} as const satisfies JSONSchema;

export const createAndPayResponseSchema = {
  type: 'object',
  properties: {
    message: { type: 'string' },
    transaction: transactionSchema,
  },
  required: ['message', 'transaction'],
  additionalProperties: false,
} as const satisfies JSONSchema;
