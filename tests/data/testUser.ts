import { env } from '@helpers/envConfig';

/** Pre-existing test user. Read-only — tests that need a fresh account use userFactory. */
export const testUser = {
  email: env.testUserEmail,
  password: env.testUserPassword,
} as const;
