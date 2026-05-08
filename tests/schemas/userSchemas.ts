import type { JSONSchema } from 'json-schema-to-ts';

export const signupResponseSchema = {
  type: 'object',
  properties: { message: { type: 'string', minLength: 1 } },
  required: ['message'],
  additionalProperties: false,
} as const satisfies JSONSchema;

export const loginResponseSchema = {
  type: 'object',
  properties: { authToken: { type: 'string', minLength: 1 } },
  required: ['authToken'],
  additionalProperties: false,
} as const satisfies JSONSchema;

export const userProfileSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    email: { type: 'string', format: 'email' },
    hasAvatar: { type: 'boolean' },
    fcmToken: { type: ['string', 'null'] },
    role: { type: ['string', 'null'] },
    createdBy: { type: ['string', 'null'] },
    name: { type: ['string', 'null'] },
    gender: { type: ['string', 'null'] },
    orderNotificationsEnabled: { type: 'boolean' },
  },
  required: [
    'id', 'email', 'hasAvatar', 'fcmToken', 'role',
    'createdBy', 'name', 'gender', 'orderNotificationsEnabled',
  ],
  additionalProperties: false,
} as const satisfies JSONSchema;
