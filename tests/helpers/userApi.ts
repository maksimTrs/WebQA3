import { expect, type APIResponse } from '@playwright/test';
import type { BaseApi } from '@helpers/baseApi';
import type {
  LoginPayload, LoginResponse, SignupPayload, SignupResponse, UserProfile,
} from '@models/user';

/**
 * Domain client for /user. Two methods per endpoint:
 *   - happy-path (e.g. signup)         — asserts expected status, returns typed body
 *   - raw       (e.g. signupResponse)  — returns APIResponse, never asserts
 * Composes BaseApi rather than extending it — keeps transport pluggable and
 * removes constructor duplication across resources.
 */
export class UserApi {
  constructor(private readonly http: BaseApi) {}

  signupResponse(payload: SignupPayload): Promise<APIResponse> {
    return this.http.post('/user/signup', { json: payload, tag: 'signup' });
  }

  async signup(payload: SignupPayload): Promise<SignupResponse> {
    const r = await this.signupResponse(payload);
    expect(r.status(), 'POST /user/signup').toBe(200);
    return r.json();
  }

  loginResponse(payload: LoginPayload): Promise<APIResponse> {
    return this.http.post('/user/login', { json: payload, tag: 'login' });
  }

  async login(payload: LoginPayload): Promise<LoginResponse> {
    const r = await this.loginResponse(payload);
    expect(r.status(), 'POST /user/login').toBe(200);
    return r.json();
  }

  getCurrentUserResponse(): Promise<APIResponse> {
    return this.http.get('/user', { tag: 'getCurrentUser' });
  }

  async getCurrentUser(): Promise<UserProfile> {
    const r = await this.getCurrentUserResponse();
    expect(r.status(), 'GET /user').toBe(200);
    return r.json();
  }
}
