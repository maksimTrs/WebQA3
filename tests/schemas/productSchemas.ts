import type { JSONSchema } from 'json-schema-to-ts';

export const productSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', minLength: 1 },
    description: { type: 'string' },
    name: { type: 'string', minLength: 1 },
    price: { type: 'number', minimum: 0 },
    imageUrl: { type: 'string' },
    iamgeUrl: { type: 'string' },
    stockQuantity: { type: 'integer', minimum: 0 },
    isOutOfStock: { type: 'boolean' },
    popularity: { type: 'number', minimum: 0 },
    rating: { type: 'number', minimum: 0, maximum: 5 },
    ownerId: { type: ['integer', 'null'] },
  },
  required: [
    'id', 'description', 'name', 'price', 'imageUrl', 'iamgeUrl',
    'stockQuantity', 'isOutOfStock', 'popularity', 'rating', 'ownerId',
  ],
  additionalProperties: false,
} as const satisfies JSONSchema;

export const productsResponseSchema = {
  type: 'object',
  properties: {
    message: { type: 'string' },
    products: { type: 'array', items: productSchema },
    sale: { type: 'number', minimum: 0, maximum: 1 },
  },
  required: ['message', 'products', 'sale'],
  additionalProperties: false,
} as const satisfies JSONSchema;
