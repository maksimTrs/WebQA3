import type { FromSchema } from 'json-schema-to-ts';
import type {
  signupResponseSchema,
  loginResponseSchema,
  userProfileSchema,
} from '@schemas/userSchemas';

// Response shapes are derived from the AJV schemas — single source of truth.
export type SignupResponse = FromSchema<typeof signupResponseSchema>;
export type LoginResponse = FromSchema<typeof loginResponseSchema>;
export type UserProfile = FromSchema<typeof userProfileSchema>;

// Request payloads have no schema — hand-written from the API contract.
export interface SignupPayload {
  email: string;
  password: string;
  passwordConfirm: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}
