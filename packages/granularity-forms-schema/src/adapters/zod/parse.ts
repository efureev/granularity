import type {
  GrSchemaConstraints,
  GrSchemaFormat,
  GrSchemaKind,
  GrSchemaModel,
  GrSchemaNode,
  GrSchemaObjectNode,
  GrSchemaOption,
  GrSchemaParseOptions,
  GrSchemaUnionNode,
  GrSchemaWarning,
} from '../../model'
import { GR_SCHEMA_MODEL_VERSION, joinPath, unionIsResolved } from '../../model'

import type { ZodCheck, ZodLike } from './introspect'
import {
  catchallOf,
  checksOf,
  defaultOf,
  descriptionOf,
  discriminatorOf,
  elementOf,
  innerOf,
  isZodSchema,
  metaOf,
  optionsOf,
  passesUnknownKeys,
  schemaFormatOf,
  shapeOf,
  typeNameOf,
} from './introspect'

interface Unwrapped {
  schema: ZodLike
  optional: boolean
  nullable: boolean
  default?: unknown
  readOnly: boolean
  /** Схема что-то делает со значением, чего модель не выражает. */
  residual: boolean
}

const WRAPPERS = new Set(['optional', 'nullable', 'default', 'prefault', 'readonly', 'branded', 'lazy', 'pipe', 'catch', 'nonoptional'])
const RESIDUAL_WRAPPERS = new Set(['effects', 'transform', 'pipe', 'catch', 'custom'])

/**
 * Снимает обёртки, запоминая, что каждая означает.
 *
 * `.optional()`, `.nullable()` и `.default()` меняют не тип поля, а его
 * обязательность и начальное значение — модель хранит их отдельными признаками.
 * `.transform()` и `.pipe()` меняют само значение: их модель не выражает, и
 * узел помечается для полной проверки схемой.
 */
function unwrap(schema: ZodLike): Unwrapped {
  const result: Unwrapped = { schema, optional: false, nullable: false, readOnly: false, residual: false }
  let current: ZodLike | undefined = schema
  let guard = 0

  while (current && guard < 20) {
    guard += 1
    const name = typeNameOf(current)

    if (RESIDUAL_WRAPPERS.has(name)) result.residual = true

    if (name === 'optional') result.optional = true
    else if (name === 'nullable') result.nullable = true
    else if (name === 'default' || name === 'prefault') result.default = defaultOf(current)
    else if (name === 'readonly') result.readOnly = true
    else if (!WRAPPERS.has(name) && name !== 'effects') break

    const inner = innerOf(current)
    if (!inner) break

    current = inner
    result.schema = current
  }

  return result
}

function kindOf(name: string): GrSchemaKind {
  switch (name) {
    case 'string': return 'string'
    case 'number':
    case 'bigint': return 'number'
    case 'boolean': return 'boolean'
    case 'date': return 'date'
    case 'file': return 'file'
    case 'object': return 'object'
    case 'array':
    case 'tuple':
    case 'set': return 'array'
    case 'enum':
    case 'nativeenum':
    case 'literal': return 'string'
    case 'union':
    case 'discriminatedunion': return 'union'
    default: return 'unknown'
  }
}

/** Строковые проверки zod, у которых есть прямое соответствие в модели. */
const STRING_FORMATS: Record<string, GrSchemaFormat> = {
  email: 'email',
  url: 'url',
  uuid: 'uuid',
  guid: 'uuid',
  ipv4: 'ipv4',
  ipv6: 'ipv6',
  cuid: 'slug',
  datetime: 'date-time',
  date: 'date',
  time: 'time',
  base64: 'binary',
}

function applyChecks(
  checks: ZodCheck[],
  kind: GrSchemaKind,
  constraints: GrSchemaConstraints,
): { format?: GrSchemaFormat, message?: string, residual: boolean } {
  let format: GrSchemaFormat | undefined
  let message: string | undefined
  let residual = false

  for (const check of checks) {
    const value = typeof check.value === 'number' ? check.value : undefined

    switch (check.kind) {
      // Длина строки и массива — те же `min`/`max` модели: ядро меряет их
      // одинаково и различает по виду значения, а не по имени правила.
      case 'min_length':
      case 'min_size':
      case 'min':
        if (check.inclusive === false) constraints.exclusiveMin = value
        else constraints.min = value
        break

      case 'max_length':
      case 'max_size':
      case 'max':
        if (check.inclusive === false) constraints.exclusiveMax = value
        else constraints.max = value
        break

      case 'length_equals':
      case 'size_equals':
      case 'length':
        constraints.len = value
        break

      case 'greater_than':
        if (check.inclusive === false) constraints.exclusiveMin = value
        else constraints.min = value
        break

      case 'less_than':
        if (check.inclusive === false) constraints.exclusiveMax = value
        else constraints.max = value
        break

      case 'multiple_of':
      case 'multipleof':
        constraints.step = value
        break

      case 'int':
        constraints.integer = true
        break

      case 'number_format':
        if (check.format === 'safeint' || check.format === 'int32' || check.format === 'int')
          constraints.integer = true
        break

      case 'regex':
        if (check.regex) {
          constraints.pattern = check.regex.source
          constraints.patternFlags = check.regex.flags
        }
        break

      case 'string_format':
        if (check.format === 'regex') {
          if (check.regex) {
            constraints.pattern = check.regex.source
            constraints.patternFlags = check.regex.flags
          }
        }
        else if (check.format && check.format in STRING_FORMATS) {
          format = STRING_FORMATS[check.format]
        }
        else if (check.format) {
          // Формат, которого модель не знает, остаётся за полной проверкой схемой.
          residual = true
        }
        break

      case '':
        break

      default:
        if (check.kind in STRING_FORMATS) format = STRING_FORMATS[check.kind]
        else residual = true
    }

    if (check.message && !message) message = check.message
  }

  if (kind === 'array' && constraints.integer) delete constraints.integer

  return { format, message, residual }
}

function toOptions(values: unknown[]): GrSchemaOption[] {
  return values
    .filter((value): value is string | number | boolean =>
      typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean')
    .map(value => ({ value, label: String(value) }))
}

interface ZodParseContext {
  warnings: GrSchemaWarning[]
  maxDepth: number
  annotationPrefix: string | false
}

function parseNode(
  raw: ZodLike,
  key: string,
  path: string,
  requiredByParent: boolean,
  ctx: ZodParseContext,
  depth: number,
): GrSchemaNode {
  if (depth > ctx.maxDepth) {
    ctx.warnings.push({ path, code: 'depth-exceeded', message: `Глубина ${depth} превысила предел — поддерево не разобрано` })
    return unknownNode(key, path, requiredByParent)
  }

  const { schema, optional, nullable, default: defaultValue, readOnly, residual: wrapperResidual } = unwrap(raw)
  const name = typeNameOf(schema)
  const kind = kindOf(name)
  const constraints: GrSchemaConstraints = {}
  const { format, message, residual: checkResidual } = applyChecks(checksOf(schema), kind, constraints)
  // Формат бывает объявлен и самой схемой, и проверкой — см. `schemaFormatOf`.
  const declaredFormat = STRING_FORMATS[schemaFormatOf(schema) ?? '']

  const meta = ctx.annotationPrefix === false ? undefined : metaOf(schema)
  const literal = name === 'literal' ? optionsOf(schema)?.[0] : undefined

  const base = {
    path,
    key,
    kind,
    format: (meta?.format as GrSchemaFormat | undefined) ?? format ?? declaredFormat,
    title: (meta?.title as string | undefined),
    description: descriptionOf(schema) ?? (meta?.description as string | undefined),
    required: requiredByParent && !optional,
    nullable,
    readOnly,
    writeOnly: false,
    deprecated: meta?.deprecated === true,
    default: defaultValue,
    const: literal,
    options: name === 'enum' || name === 'nativeenum' ? toOptions(optionsOf(schema) ?? []) : undefined,
    constraints,
    residual: wrapperResidual || checkResidual,
    annotations: meta,
    // Сообщение схемы сильнее нашего: автор написал его для этого поля.
    ...(message ? { annotations: { ...meta, 'x-message': message } } : {}),
  }

  if (kind === 'object') {
    const shape = shapeOf(schema) ?? {}
    const catchall = catchallOf(schema)

    return {
      ...base,
      kind: 'object',
      additional: catchall !== undefined || passesUnknownKeys(schema),
      additionalValue: catchall
        ? parseNode(catchall, '*', joinPath(path, '*'), true, ctx, depth + 1)
        : undefined,
      fields: Object.entries(shape).map(([childKey, child]) =>
        parseNode(child, childKey, joinPath(path, childKey), true, ctx, depth + 1)),
    }
  }

  if (kind === 'array') {
    const element = elementOf(schema)
    const itemPath = joinPath(path, '*')

    if (name === 'set') {
      ctx.warnings.push({ path, code: 'lossy-constraint', message: '`z.set()` рисуется списком: модель формы хранит массив' })
      constraints.uniqueItems = true
    }

    return {
      ...base,
      kind: 'array',
      item: element
        ? parseNode(element, '*', itemPath, true, ctx, depth + 1)
        : unknownNode('*', itemPath, true),
    }
  }

  if (kind === 'union') {
    const variants = (optionsOf(schema) ?? []).filter(isZodSchema)
    const parsedVariants = variants
      .map((variant, index) => parseNode(variant, String(index), path, true, ctx, depth + 1))
      .filter((node): node is GrSchemaObjectNode => node.kind === 'object')

    // Объединение примитивов — это перечисление; объединение объектов без
    // дискриминатора модель не выражает и отдаёт полной проверке схемой.
    if (parsedVariants.length === 0) {
      const literals = variants
        .map(variant => optionsOf(variant)?.[0])
        .filter(value => value !== undefined)

      if (literals.length === variants.length && literals.length > 0)
        return { ...base, kind: 'string', options: toOptions(literals) }
    }

    const union: GrSchemaUnionNode = {
      ...base,
      kind: 'union',
      discriminator: discriminatorOf(schema),
      variants: parsedVariants,
    }

    // Разобранное объединение выражено моделью целиком: форма сама рисует
    // переключатель ветки, и гонять ради него полную проверку схемой незачем.
    if (unionIsResolved(union)) return union

    ctx.warnings.push({
      path,
      code: 'unsupported-node',
      message: 'Объединение без дискриминатора — ветку выбрать нельзя, значение проверяется схемой целиком',
    })

    return { ...union, residual: true }
  }

  if (kind === 'unknown')
    ctx.warnings.push({ path, code: 'unsupported-node', message: `Тип «${name}» не разобран — поле показано только на чтение` })

  return { ...base, kind }
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

/**
 * Разбирает zod-схему в нейтральную модель.
 *
 * Полная проверка остаётся за самой схемой: `validate` собирается из
 * `safeParse`, и всё, чего модель не выразила (`.refine`, кросс-полевые
 * условия, `.transform`), проверяется ею — одна схема остаётся источником
 * правды, а не расходится с формой.
 */
export function parseZodSchema(schema: ZodLike, options: GrSchemaParseOptions = {}): GrSchemaModel {
  const ctx: ZodParseContext = {
    warnings: [],
    maxDepth: options.maxDepth ?? 12,
    annotationPrefix: options.annotationPrefix ?? 'x-',
  }

  const parsed = parseNode(schema, '', '', true, ctx, 0)
  const root: GrSchemaObjectNode = parsed.kind === 'object'
    ? parsed
    : { ...unknownNode('', '', true), kind: 'object', fields: [], additional: false }

  if (parsed.kind !== 'object')
    ctx.warnings.push({ path: '', code: 'unsupported-node', message: 'Корень схемы — не объект: форме нечего раскладывать' })

  return {
    version: GR_SCHEMA_MODEL_VERSION,
    adapter: 'zod',
    root,
    validate: options.validate ?? createZodValidate(schema),
    warnings: ctx.warnings,
  }
}

/** Полная проверка схемой: пути ошибок zod приводятся к точечной форме. */
export function createZodValidate(schema: ZodLike): GrSchemaModel['validate'] {
  if (typeof schema.safeParse !== 'function') return undefined

  return (value: unknown) => {
    const result = schema.safeParse!(value) as {
      success: boolean
      error?: { issues?: { path?: (string | number)[], message?: string, code?: string }[] }
    }

    if (result.success) return []

    return (result.error?.issues ?? []).map(issue => ({
      path: (issue.path ?? []).join('.'),
      message: issue.message ?? '',
      code: issue.code,
    }))
  }
}
