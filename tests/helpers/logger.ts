import { env, type LogLevel } from '@helpers/envConfig';

const RANK: Record<LogLevel, number> = { debug: 10, info: 20, warn: 30, error: 40 };
const COLOR: Record<LogLevel, string> = {
  debug: '\x1b[90m', info: '\x1b[36m', warn: '\x1b[33m', error: '\x1b[31m',
};
const RESET = '\x1b[0m';

const sensitiveValues = new Set<string>();
const sensitiveKeys = new Set([
  'authorization', 'authtoken', 'token', 'password', 'passwordconfirm',
  'cookie', 'set-cookie', 'cvv',
]);

/**
 * Register a value to be masked everywhere it appears in logs.
 *
 * Direct masking (replacing the value with "***" via maskString) works in any
 * environment. The ::add-mask:: workflow command is supplementary — it tells
 * the GitHub Actions runner to redact the value across the entire job log,
 * which catches anything we might miss (e.g. stack traces from third-party
 * code that bypasses our logger).
 *
 * It MUST only fire inside GitHub Actions: anywhere else (local Docker, other
 * CIs) the directive is just printed verbatim, leaking the secret instead of
 * masking it.
 */
export function registerSensitiveValue(value: string | undefined | null): void {
  if (!value || value.length < 3 || sensitiveValues.has(value)) return;
  sensitiveValues.add(value);
  if (env.isGithubActions) process.stdout.write(`::add-mask::${value}\n`);
}

if (env.maskSensitive) {
  registerSensitiveValue(env.testUserEmail);
  registerSensitiveValue(env.testUserPassword);
}

function maskString(text: string): string {
  if (!env.maskSensitive) return text;
  let out = text;
  for (const v of sensitiveValues) {
    out = out.replaceAll(v, '***');
  }
  return out;
}

function maskValue(value: unknown): unknown {
  if (value === null || value === undefined) return value;
  if (typeof value === 'string') return maskString(value);
  if (Array.isArray(value)) return value.map(maskValue);
  if (typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = sensitiveKeys.has(k.toLowerCase()) ? '***' : maskValue(v);
    }
    return out;
  }
  return value;
}

function log(level: LogLevel, message: string, payload?: unknown): void {
  if (RANK[level] < RANK[env.logLevel]) return;
  const color = env.isCI ? '' : COLOR[level];
  const reset = env.isCI ? '' : RESET;
  const tag = `[${level.toUpperCase()}]`.padEnd(7);
  const tail = payload === undefined ? '' : ' ' + JSON.stringify(maskValue(payload));
  process.stdout.write(`${color}${new Date().toISOString()} ${tag}${reset} ${maskString(message)}${tail}\n`);
}

export const logger = {
  debug: (m: string, p?: unknown): void => log('debug', m, p),
  info:  (m: string, p?: unknown): void => log('info', m, p),
  warn:  (m: string, p?: unknown): void => log('warn', m, p),
  error: (m: string, p?: unknown): void => log('error', m, p),
} as const;
