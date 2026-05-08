import { faker } from '@faker-js/faker';
import type { SignupPayload } from '@models/user';

export function createSignupPayload(overrides: Partial<SignupPayload> = {}): SignupPayload {
  const password = faker.internet.password({ length: 8 });
  // Timestamp suffix avoids collisions across parallel workers/runs.
  const id = `${faker.number.int({ min: 1000, max: 9999 })}_${Date.now().toString(36)}`;
  return {
    email: `test${id}@mail.com`,
    password,
    passwordConfirm: password,
    ...overrides,
  };
}

export function asLoginCredentials(signup: SignupPayload): { email: string; password: string } {
  return { email: signup.email, password: signup.password };
}
