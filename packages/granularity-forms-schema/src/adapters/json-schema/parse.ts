import type {
  GrSchemaConstraints,
  GrSchemaKind,
  GrSchemaModel,
  GrSchemaNode,
  GrSchemaObjectNode,
  GrSchemaOption,
  GrSchemaParseOptions,
  GrSchemaWarning,
} from '../../model'
import { GR_SCHEMA_MODEL_VERSION, joinPath } from '../../model'

import type { JsonSchemaDocument, JsonSchemaType } from './types'

interface ParseContext {
  rootDocument: JsonSchemaDocument
  options: Required<Pick<GrSchemaParseOptions, 'maxDepth' | 'requiredByDefault'>> & GrSchemaParseOptions
  warnings: GrSchemaWarning[]
  /** Уже разворачиваемые `$ref` — защита от рекурсивной схемы. */
  refStack: string[]
}

const KIND_BY_TYPE: Record<Exclude<JsonSchemaType, 'null'>, GrSchemaKind> = {
  string: 'string',
  number: 'number',
  integer: 'number',
  boolean: 'boolean',
  object: 'object',
  array: 'array',
}

/**
 * Разрешает внутреннюю ссылку.
 *
 * Только внутри документа (`#/$defs/…`, `#/definitions/…`, `#/properties/…`):
 * внешние `$ref` требуют загрузки по сети, а это уже транспорт, который пакет
 * потребителю не навязывает — такую схему он разрешает заранее сам.
 */
function resolveRef(ref: string, ctx: ParseContext, path: string): JsonSchemaDocument | undefined {
  if (!ref.startsWith('#')) {
    ctx.warnings.push({ path, code: 'unresolved-ref', message: `Внешняя ссылка «${ref}» не разрешается: разрешите схему до передачи в форму` })
    return undefined
  }

  const segments = ref.slice(1).split('/').filter(Boolean).map(segment => segment.replace(/~1/g, '/').replace(/~0/g, '~'))
  let cursor: unknown = ctx.rootDocument

  for (const segment of segments) {
    if (!cursor || typeof cursor !== 'object') {
      ctx.warnings.push({ path, code: 'unresolved-ref', message: `Ссылка «${ref}» никуда не ведёт` })
      return undefined
    }
    cursor = (cursor as Record<string, unknown>)[segment]
  }

  if (!cursor || typeof cursor !== 'object') {
    ctx.warnings.push({ path, code: 'unresolved-ref', message: `Ссылка «${ref}» никуда не ведёт` })
    return undefined
  }

  return cursor as JsonSchemaDocument
}

/** Сливает `allOf` в один документ: ограничения складываются, `required` объединяется. */
function mergeAllOf(document: JsonSchemaDocument, ctx: ParseContext, path: string): JsonSchemaDocument {
  if (!document.allOf || document.allOf.length === 0) return document

  const merged: JsonSchemaDocument = { ...document }
  delete merged.allOf

  for (const part of document.allOf) {
    const resolved = part.$ref ? resolveRef(part.$ref, ctx, path) ?? {} : part
    const flattened = mergeAllOf(resolved, ctx, path)

    merged.properties = { ...(merged.properties ?? {}), ...(flattened.properties ?? {}) }
    merged.required = [...new Set([...(merged.required ?? []), ...(flattened.required ?? [])])]

    for (const [key, value] of Object.entries(flattened)) {
      if (key === 'properties' || key === 'required') continue
      if (merged[key] === undefined) merged[key] = value
    }
  }

  return merged
}

function pickType(document: JsonSchemaDocument): { type?: JsonSchemaType, nullable: boolean } {
  const raw = document.type

  if (Array.isArray(raw)) {
    const nullable = raw.includes('null')
    const type = raw.find(item => item !== 'null')
    return { type, nullable: nullable || document.nullable === true }
  }

  return { type: raw, nullable: document.nullable === true }
}

function toOptions(values: unknown[], document: JsonSchemaDocument): GrSchemaOption[] {
  // `x-enumNames` — расширение, которым OpenAPI-генераторы отдают подписи.
  const labels = document['x-enumNames'] ?? document['x-enum-varnames']

  return values
    .filter((value): value is string | number | boolean =>
      typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean')
    .map((value, index) => ({
      value,
      label: Array.isArray(labels) && typeof labels[index] === 'string' ? String(labels[index]) : String(value),
    }))
}

function readConstraints(document: JsonSchemaDocument, kind: GrSchemaKind): GrSchemaConstraints {
  const constraints: GrSchemaConstraints = {}

  if (kind === 'string') {
    if (document.minLength !== undefined) constraints.min = document.minLength
    if (document.maxLength !== undefined) constraints.max = document.maxLength
    if (document.pattern) constraints.pattern = document.pattern
  }

  if (kind === 'number') {
    if (document.minimum !== undefined) constraints.min = document.minimum
    if (document.maximum !== undefined) constraints.max = document.maximum
    if (document.multipleOf !== undefined) constraints.step = document.multipleOf
    if (document.type === 'integer') constraints.integer = true

    // Draft 4 писал `exclusiveMinimum: true` рядом с `minimum`; свежие драфты —
    // числом. Обе формы живы в реальных схемах, обе поддерживаем.
    if (typeof document.exclusiveMinimum === 'number') constraints.exclusiveMin = document.exclusiveMinimum
    else if (document.exclusiveMinimum === true && document.minimum !== undefined) {
      constraints.exclusiveMin = document.minimum
      delete constraints.min
    }

    if (typeof document.exclusiveMaximum === 'number') constraints.exclusiveMax = document.exclusiveMaximum
    else if (document.exclusiveMaximum === true && document.maximum !== undefined) {
      constraints.exclusiveMax = document.maximum
      delete constraints.max
    }
  }

  if (kind === 'array') {
    if (document.minItems !== undefined) constraints.min = document.minItems
    if (document.maxItems !== undefined) constraints.max = document.maxItems
    if (document.uniqueItems) constraints.uniqueItems = true
  }

  return constraints
}

function readAnnotations(document: JsonSchemaDocument, prefix: string | false): Record<string, unknown> | undefined {
  if (prefix === false) return undefined

  const entries = Object.entries(document).filter(([key]) => key.startsWith(prefix))
  return entries.length > 0 ? Object.fromEntries(entries) : undefined
}

/** Осталось ли в документе то, что модель не выражает. */
function hasResidual(document: JsonSchemaDocument): boolean {
  return Boolean(
    document.oneOf || document.anyOf || document.not || document.if
    || (document.additionalProperties && typeof document.additionalProperties === 'object'),
  )
}

function parseNode(
  rawDocument: JsonSchemaDocument,
  key: string,
  path: string,
  required: boolean,
  ctx: ParseContext,
  depth: number,
): GrSchemaNode {
  if (depth > ctx.options.maxDepth) {
    ctx.warnings.push({ path, code: 'depth-exceeded', message: `Глубина ${depth} превысила предел — поддерево не разобрано` })
    return unknownNode(key, path, required)
  }

  let document = rawDocument

  if (document.$ref) {
    if (ctx.refStack.includes(document.$ref)) {
      ctx.warnings.push({ path, code: 'depth-exceeded', message: `Рекурсивная ссылка «${document.$ref}» оборвана` })
      return unknownNode(key, path, required)
    }

    const resolved = resolveRef(document.$ref, ctx, path)
    if (!resolved) return unknownNode(key, path, required)

    ctx.refStack.push(document.$ref)
    try {
      return parseNode({ ...resolved, ...stripRef(document) }, key, path, required, ctx, depth)
    }
    finally {
      ctx.refStack.pop()
    }
  }

  document = mergeAllOf(document, ctx, path)

  const { type, nullable } = pickType(document)
  const enumValues = document.enum ?? (document.const !== undefined ? [document.const] : undefined)
  const kind: GrSchemaKind = type ? KIND_BY_TYPE[type as Exclude<JsonSchemaType, 'null'>] ?? 'unknown' : inferKind(document)

  const base = {
    path,
    key,
    kind,
    format: document.format ?? (document.contentEncoding === 'base64' ? 'binary' : undefined),
    title: document.title,
    description: document.description,
    required,
    nullable,
    readOnly: document.readOnly === true,
    writeOnly: document.writeOnly === true,
    deprecated: document.deprecated === true,
    default: document.default,
    const: document.const,
    examples: document.examples,
    options: enumValues && document.const === undefined ? toOptions(enumValues, document) : undefined,
    constraints: readConstraints(document, kind),
    residual: hasResidual(document),
    annotations: readAnnotations(document, ctx.options.annotationPrefix ?? 'x-'),
  }

  if (kind === 'object') {
    const requiredKeys = new Set(document.required ?? [])
    const properties = document.properties ?? {}

    return {
      ...base,
      kind: 'object',
      additional: document.additionalProperties !== false && document.additionalProperties !== undefined,
      fields: Object.entries(properties).map(([childKey, child]) => parseNode(
        child,
        childKey,
        joinPath(path, childKey),
        requiredKeys.has(childKey) || ctx.options.requiredByDefault,
        ctx,
        depth + 1,
      )),
    }
  }

  if (kind === 'array') {
    const itemPath = joinPath(path, '*')
    const item = document.items
      ? parseNode(document.items, '*', itemPath, true, ctx, depth + 1)
      : unknownNode('*', itemPath, true)

    return {
      ...base,
      kind: 'array',
      item,
      tuple: document.prefixItems?.map((child, index) =>
        parseNode(child, String(index), joinPath(path, String(index)), true, ctx, depth + 1)),
    }
  }

  if (kind === 'unknown' && !type) {
    ctx.warnings.push({ path, code: 'unsupported-node', message: 'Тип узла не объявлен — поле показано только на чтение' })
  }

  return { ...base, kind } as GrSchemaNode
}

/** `$ref` рядом с другими ключами: свои перекрывают то, на что ссылаются. */
function stripRef(document: JsonSchemaDocument): JsonSchemaDocument {
  const copy = { ...document }
  delete copy.$ref
  return copy
}

/** Тип не объявлен — выводим из присутствующих ключей. */
function inferKind(document: JsonSchemaDocument): GrSchemaKind {
  if (document.properties) return 'object'
  if (document.items || document.prefixItems) return 'array'
  if (document.enum || document.const !== undefined) return 'string'
  return 'unknown'
}

function unknownNode(key: string, path: string, required: boolean): GrSchemaNode {
  return {
    path,
    key,
    kind: 'unknown',
    required,
    nullable: true,
    readOnly: true,
    writeOnly: false,
    deprecated: false,
    constraints: {},
    residual: false,
  }
}

/** Разбирает JSON Schema в нейтральную модель. */
export function parseJsonSchema(
  schema: JsonSchemaDocument,
  options: GrSchemaParseOptions = {},
): GrSchemaModel {
  const ctx: ParseContext = {
    rootDocument: schema,
    options: {
      maxDepth: options.maxDepth ?? 12,
      requiredByDefault: options.requiredByDefault ?? false,
      ...options,
    },
    warnings: [],
    refStack: [],
  }

  const parsed = parseNode(schema, '', '', true, ctx, 0)
  const root: GrSchemaObjectNode = parsed.kind === 'object'
    ? parsed
    : { ...unknownNode('', '', true), kind: 'object', fields: [], additional: false }

  if (parsed.kind !== 'object') {
    ctx.warnings.push({ path: '', code: 'unsupported-node', message: 'Корень схемы — не объект: форме нечего раскладывать' })
  }

  return {
    version: GR_SCHEMA_MODEL_VERSION,
    adapter: 'json-schema',
    root,
    validate: options.validate,
    warnings: ctx.warnings,
  }
}
