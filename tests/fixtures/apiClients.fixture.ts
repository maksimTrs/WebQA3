import { test as base, request as requestFn, type APIRequestContext } from '@playwright/test';
import { env } from '@helpers/envConfig';
import { logger, registerSensitiveValue } from '@helpers/logger';
import { BaseApi } from '@helpers/baseApi';
import { UserApi } from '@helpers/userApi';
import { ProductApi } from '@helpers/productApi';
import { OrderApi } from '@helpers/orderApi';
import { testUser } from '@data/testUser';
import type { LoginResponse } from '@models/user';

export interface AuthSession {
  authToken: string;
  email: string;
}

export interface ApiClients {
  user: UserApi;
  product: ProductApi;
  order: OrderApi;
}

interface TestFixtures {
  apiClients: ApiClients;
  anonClients: ApiClients;
}

interface WorkerFixtures {
  authSession: AuthSession;
}

// Auth is a per-request concern (Authorization header), not a per-context one.
// `apiClients` and `anonClients` both run on the built-in `request` fixture
// and differentiate solely by whether BaseApi injects the header.
const buildClients = (request: APIRequestContext, authToken?: string): ApiClients => {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (authToken) headers['Authorization'] = authToken;
  const http = new BaseApi(request, env.apiBaseUrl, headers);
  return {
    user: new UserApi(http),
    product: new ProductApi(http),
    order: new OrderApi(http),
  };
};

export const test = base.extend<TestFixtures, WorkerFixtures>({
  // Worker-scoped: login once per worker, share JWT across all tests.
  // Token is registered with the masking logger so it never leaks in stdout/CI.
  authSession: [
    async ({}, use) => {
      logger.info(`Authenticating worker session as ${testUser.email}`);
      const ctx = await requestFn.newContext({ baseURL: env.apiBaseUrl });
      try {
        const { user } = buildClients(ctx);
        const response = await user.loginResponse(testUser);
        if (!response.ok()) {
          const body = await response.text().catch(() => '<no body>');
          throw new Error(
            `authSession login failed (status ${response.status()}). ` +
              `Check TEST_USER_EMAIL/TEST_USER_PASSWORD env vars. ` +
              `Body: ${body.slice(0, 200)}`,
          );
        }
        const { authToken } = (await response.json()) as LoginResponse;
        registerSensitiveValue(authToken);
        logger.info('Worker session ready');
        await use({ authToken, email: testUser.email });
      } finally {
        await ctx.dispose();
      }
    },
    { scope: 'worker' },
  ],

  apiClients: async ({ authSession, request }, use) => {
    await use(buildClients(request, authSession.authToken));
  },

  anonClients: async ({ request }, use) => {
    await use(buildClients(request));
  },
});

export { expect } from '@playwright/test';
