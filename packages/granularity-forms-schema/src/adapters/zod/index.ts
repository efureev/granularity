import type { GrSchemaAdapter } from '../../model'

import type { ZodLike } from './introspect'
import { isZodSchema } from './introspect'
import { parseZodSchema } from './parse'

export const zodAdapter: GrSchemaAdapter<ZodLike> = {
  name: 'zod',
  supports: isZodSchema,
  parse: parseZodSchema,
}

export { isZodSchema, type ZodLike } from './introspect'
export { createZodValidate, parseZodSchema } from './parse'
