import { test, expect } from '@fixtures/apiClients.fixture';
import { validateSchema } from '@helpers/schemaValidator';
import { createSignupPayload } from '@data/userFactory';
import { testUser } from '@data/testUser';
import { loginResponseSchema, signupResponseSchema } from '@schemas/userSchemas';

test.describe('Auth — /user/signup', { tag: '@api' }, () => {
  test('creates a new user and returns success message', { tag: '@smoke' }, async ({
    anonClients,
  }) => {
    const payload = createSignupPayload();

    const body = await anonClients.user.signup(payload);

    validateSchema(body, signupResponseSchema, 'signup response');
    expect(body.message).toBe('You have successfully registered');
  });

  test('rejects duplicate email with 400 and code 30000', async ({ anonClients }) => {
    // Establish the duplicate explicitly — don't rely on testUser already being
    // in the DB (would silently flip to a passing 200 on a fresh env).
    const payload = createSignupPayload();
    await anonClients.user.signup(payload);

    const response = await anonClients.user.signupResponse(payload);

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body).toMatchObject({
      error: {
        code: 30000,
        message: expect.stringMatching(/duplicate|unique/i),
      },
    });
  });

  test('rejects mismatched password confirmation', async ({ anonClients }) => {
    const payload = createSignupPayload({ passwordConfirm: 'mismatch' });
    const response = await anonClients.user.signupResponse(payload);

    await expect(response).not.toBeOK();
  });
});

test.describe('Auth — /user/login', { tag: '@api' }, () => {
  test('authenticates with valid credentials and returns JWT', { tag: '@smoke' }, async ({
    anonClients,
  }) => {
    const body = await anonClients.user.login(testUser);

    validateSchema(body, loginResponseSchema, 'login response');
    expect(body.authToken.split('.')).toHaveLength(3); // JWT = header.payload.signature
  });

  test('rejects wrong password with 4xx and "Wrong credentials" message', async ({
    anonClients,
  }) => {
    // NB: the API enforces password ≤ 20 chars (Joi schema). Passing a longer
    // string returns a 30001 Field Validation Error instead of the credential
    // mismatch we want to assert on, so keep the wrong password under 20 chars.
    const response = await anonClients.user.loginResponse({
      email: testUser.email,
      password: 'wrongpass',
    });

    await expect(response).not.toBeOK();
    const body = await response.json();
    expect(body).toMatchObject({
      error: { message: expect.stringMatching(/wrong credentials/i) },
    });
  });

  test('rejects unknown email with 4xx', async ({ anonClients }) => {
    const response = await anonClients.user.loginResponse({
      email: `unknown${Date.now()}@nowhere.test`,
      password: 'whatever',
    });

    await expect(response).not.toBeOK();
  });
});
