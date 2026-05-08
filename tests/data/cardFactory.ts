import { faker } from '@faker-js/faker';
import type { CardDetails } from '@models/card';

export function createCardDetails(overrides: Partial<CardDetails> = {}): CardDetails {
  // Each 4-digit segment starts with a non-zero digit — the UI's numeric
  // inputs strip leading zeros, which would break value-equality assertions.
  const segment = (): string =>
    `${faker.number.int({ min: 1, max: 9 })}${faker.string.numeric(3)}`;
  const tail = `${segment()}${segment()}${segment()}`;

  // Pick a 2-digit YY 1–5 years from today so the factory never expires.
  const yy = (new Date().getFullYear() + faker.number.int({ min: 1, max: 5 })) % 100;

  return {
    number: `4444${tail}`,
    date: `${faker.number.int({ min: 1, max: 12 })}:${String(yy).padStart(2, '0')}`,
    name: faker.person.fullName().toUpperCase(),
    cvv: String(faker.number.int({ min: 100, max: 999 })),
    ...overrides,
  };
}
