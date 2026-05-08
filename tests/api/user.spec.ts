import { test, expect } from '@fixtures/apiClients.fixture';
import { validateSchema } from '@helpers/schemaValidator';
import { testUser } from '@data/testUser';
import { userProfileSchema } from '@schemas/userSchemas';

test.describe('User — /user', { tag: '@api' }, () => {
  test('returns the authenticated user profile', { tag: '@smoke' }, async ({ apiClients }) => {
    const profile = await apiClients.user.getCurrentUser();

    validateSchema(profile, userProfileSchema, 'GET /user');
    expect(profile.email).toBe(testUser.email);
    expect(profile.id).toBeGreaterThan(0);
  });

  test('rejects unauthenticated request with 401', async ({ anonClients }) => {
    const response = await anonClients.user.getCurrentUserResponse();
    expect(response.status()).toBe(401);
  });
});
