import type { FromSchema } from 'json-schema-to-ts';
import type { productSchema, productsResponseSchema } from '@schemas/productSchemas';

// Note: API has a typo — `iamgeUrl` mirrors `imageUrl`. Both fields preserved
// to keep schema validation honest about the server contract.
export type Product = FromSchema<typeof productSchema>;
export type ProductsResponse = FromSchema<typeof productsResponseSchema>;
