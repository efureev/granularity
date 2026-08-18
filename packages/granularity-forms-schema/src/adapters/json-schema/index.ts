import type { GrSchemaAdapter } from '../../model'

import { parseJsonSchema } from './parse'
import type { JsonSchemaDocument } from './types'

/**
 * Признак JSON Schema.
 *
 * Дак-типинг, а не `instanceof`: схема приходит распарсенным JSON, у неё нет
 * ни класса, ни прототипа. Ключей-признаков достаточно, чтобы не спутать её
 * ни с zod-объектом (у того есть `_def`), ни с обычными данными.
 */
function isJsonSchema(schema: unknown): schema is JsonSchemaDocument {
  if (!schema || typeof schema !== 'object' || Array.isArray(schema)) return false

  const document = schema as Record<string, unknown>
  if ('_def' in document || '~standard' in document) return false

  return '$schema' in document
    || 'properties' in document
    || 'type' in document
    || '$ref' in document
    || 'allOf' in document
}

export const jsonSchemaAdapter: GrSchemaAdapter<JsonSchemaDocument> = {
  name: 'json-schema',
  supports: isJsonSchema,
  parse: parseJsonSchema,
}

export { parseJsonSchema } from './parse'
export type { JsonSchemaDocument, JsonSchemaType } from './types'
