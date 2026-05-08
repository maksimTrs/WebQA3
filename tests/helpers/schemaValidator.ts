import Ajv, { type Schema } from 'ajv';
import addFormats from 'ajv-formats';
import type { JSONSchema } from 'json-schema-to-ts';

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

export function validateSchema(
  data: unknown,
  schema: JSONSchema,
  context = 'response',
): void {
  const validate = ajv.compile(schema as Schema);
  if (validate(data)) return;
  const issues = (validate.errors ?? [])
    .map((e) => `  • ${e.instancePath || '<root>'} ${e.message ?? ''}`)
    .join('\n');
  // throw (vs expect()) gives a clean error header in Playwright's reporter;
  // expect(false).toBe(true) shows "expected false to be true" as the headline.
  throw new Error(
    `Schema validation failed for ${context}:\n${issues}\n\nReceived:\n${
      JSON.stringify(data, null, 2).slice(0, 1000)
    }`,
  );
}
