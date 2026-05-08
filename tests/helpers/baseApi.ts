import type { APIRequestContext, APIResponse } from '@playwright/test';
import { logger } from '@helpers/logger';

export interface RequestOptions {
  headers?: Record<string, string>;
  query?: Record<string, string | number | boolean | undefined>;
  json?: unknown;
  tag?: string;
}

/**
 * Transport-only HTTP helper. No domain knowledge, no assertions.
 * Domain clients (UserApi/ProductApi/OrderApi) compose this — they own the
 * happy-path status assertions, so failure stack traces point at the caller.
 */
export class BaseApi {
  constructor(
    private readonly request: APIRequestContext,
    private readonly baseUrl: string,
    private readonly defaultHeaders: Record<string, string> = {},
  ) {}

  get(path: string, opts: RequestOptions = {}): Promise<APIResponse> {
    return this.send('GET', path, opts);
  }

  post(path: string, opts: RequestOptions = {}): Promise<APIResponse> {
    return this.send('POST', path, opts);
  }

  private buildUrl(path: string, query?: RequestOptions['query']): string {
    const base = this.baseUrl.replace(/\/+$/, '');
    const tail = path.startsWith('/') ? path : `/${path}`;
    const url = new URL(`${base}${tail}`);
    if (query) {
      for (const [k, v] of Object.entries(query)) {
        if (v !== undefined && v !== null) url.searchParams.append(k, String(v));
      }
    }
    return url.toString();
  }

  private async send(
    method: string,
    path: string,
    opts: RequestOptions,
  ): Promise<APIResponse> {
    const url = this.buildUrl(path, opts.query);
    const headers = { ...this.defaultHeaders, ...(opts.headers ?? {}) };

    logger.debug(`→ ${method} ${opts.tag ?? path}`, opts.json);

    const start = Date.now();
    const response = await this.request.fetch(url, { method, headers, data: opts.json });
    const elapsed = Date.now() - start;
    const status = response.status();

    const text = await response.text();
    const body = tryJson(text);
    const level = status >= 500 ? 'error' : status >= 400 ? 'warn' : 'debug';
    logger[level](`← ${method} ${path}`, { status, elapsedMs: elapsed, body });

    return response;
  }
}

function tryJson(text: string): unknown {
  if (!text) return '';
  try {
    return JSON.parse(text);
  } catch {
    return text.length > 500 ? `${text.slice(0, 500)}…` : text;
  }
}
