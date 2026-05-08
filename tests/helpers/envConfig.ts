/** Typed env access. Fails fast at import time if a required var is missing. */

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env variable: ${name}`);
  return v;
}

function optional(name: string, fallback: string): string {
  return process.env[name] || fallback;
}

function bool(name: string, fallback: boolean): boolean {
  const v = process.env[name];
  if (v === undefined) return fallback;
  return v.toLowerCase() === 'true' || v === '1';
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const ALLOWED_LEVELS: readonly LogLevel[] = ['debug', 'info', 'warn', 'error'];

function logLevel(): LogLevel {
  const raw = optional('LOG_LEVEL', 'info').toLowerCase();
  return (ALLOWED_LEVELS as readonly string[]).includes(raw) ? (raw as LogLevel) : 'info';
}

const baseUrl = required('BASE_URL');

export const env = {
  baseUrl,
  apiBaseUrl: optional('API_BASE_URL', `${baseUrl}/api/v1`),
  testUserEmail: required('TEST_USER_EMAIL'),
  testUserPassword: required('TEST_USER_PASSWORD'),
  logLevel: logLevel(),
  maskSensitive: bool('MASK_SENSITIVE', true),
  isCI: !!process.env.CI,
  // GitHub Actions sets this automatically to "true" inside its runners.
  // Used to gate ::add-mask:: workflow commands — emitting them anywhere else
  // (local Docker, other CI) prints the secret verbatim instead of redacting it.
  isGithubActions: process.env.GITHUB_ACTIONS === 'true',
} as const;
