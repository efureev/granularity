/**
 * Интроспекция zod без импорта zod.
 *
 * Пакет не имеет зависимостей, а адаптер обязан работать и с v3, и с v4 — у
 * которых внутренности различаются: v3 держит имя типа в `_def.typeName`
 * (`ZodString`), v4 — в `_def.type` (`string`). Чтение разведено сюда, чтобы
 * остальной адаптер знал только нормализованные ответы.
 *
 * Это единственный способ поддержать обе мажорные версии, не завися ни от одной:
 * `instanceof` требует того же экземпляра библиотеки, а его в монорепо
 * потребителя может оказаться два.
 */

export interface ZodLike {
  /**
   * Внутренности схемы. Тип намеренно широкий: у настоящего `ZodObject` это
   * `$ZodObjectDef` с собственными полями, и требование `Record<string,
   * unknown>` не дало бы передать в адаптер саму схему.
   */
  _def?: unknown
  def?: unknown
  safeParse?: (value: unknown) => unknown
  description?: unknown
  meta?: unknown
}

export interface ZodCheck {
  /** Вид проверки: `min_length`, `greater_than`, `string_format`… */
  kind: string
  /** Уточнение для `string_format` и `number_format`: `email`, `safeint`, `regex`. */
  format?: string
  value?: unknown
  regex?: RegExp
  inclusive?: boolean
  message?: string
}

export function isZodSchema(value: unknown): value is ZodLike {
  if (!value || typeof value !== 'object')
    return false

  const candidate = value as ZodLike
  const def = candidate._def ?? candidate.def

  return Boolean(def && typeof candidate.safeParse === 'function')
}

function defOf(schema: ZodLike): Record<string, unknown> {
  return (schema._def ?? schema.def ?? {}) as Record<string, unknown>
}

/**
 * Имя типа в общей форме: `string`, `number`, `object`, `array`, `optional`…
 *
 * v3 отдаёт `ZodString`, v4 — `string`; приводим к нижнему регистру без
 * префикса, чтобы дальше сравнивать одинаково.
 */
export function typeNameOf(schema: ZodLike): string {
  const def = defOf(schema)
  const raw = (def.typeName ?? def.type ?? '') as string

  return String(raw).replace(/^Zod/, '').toLowerCase()
}

/**
 * Схема внутри обёртки (`optional`, `nullable`, `default`, `readonly`).
 *
 * `def.type` намеренно не проверяется: в v4 это **строка** с именем типа, а не
 * вложенная схема, — спутать их значит развернуть обёртку в никуда.
 */
export function innerOf(schema: ZodLike): ZodLike | undefined {
  const def = defOf(schema)

  for (const candidate of [def.innerType, def.schema, def.in, def.out]) {
    if (isZodSchema(candidate))
      return candidate
  }

  return undefined
}

/**
 * Формат, объявленный самой схемой: `z.email()`, `z.uuid()`, `z.iso.date()`.
 *
 * В zod 4 это рекомендованная форма, и формат в ней лежит **на схеме**
 * (`def.format`), а не в списке проверок: `z.email()` не заводит ни одного
 * `check`. Устаревшая `z.string().email()` — наоборот. Читать надо оба места,
 * иначе современный идиом молча теряет тип поля, и почта приезжает обычной
 * строкой.
 */
export function schemaFormatOf(schema: ZodLike): string | undefined {
  const format = defOf(schema).format

  return typeof format === 'string' ? format : undefined
}

export function checksOf(schema: ZodLike): ZodCheck[] {
  const def = defOf(schema)
  const checks = def.checks

  if (!Array.isArray(checks))
    return []

  return checks.map((check) => {
    const item = check as Record<string, unknown>

    // v4 прячет параметры на уровень глубже, в `_zod.def`; v3 держит их прямо.
    const nested = (item._zod as Record<string, unknown> | undefined)?.def as Record<string, unknown> | undefined
    const source = nested ?? item

    return {
      kind: String(source.check ?? source.kind ?? ''),
      format: source.format === undefined ? undefined : String(source.format),
      value: (source.value ?? source.minimum ?? source.maximum ?? source.length ?? source.multipleOf),
      regex: (source.pattern ?? source.regex) as RegExp | undefined,
      inclusive: source.inclusive as boolean | undefined,
      message: readMessage(source.error ?? source.message),
    }
  })
}

/**
 * Сообщение проверки.
 *
 * В v4 это функция-резолвер: она принимает контекст ошибки и обычно возвращает
 * заранее написанный текст. Вызываем в `try` — автор схемы вправе собрать
 * сообщение из контекста, которого у нас нет, и тогда текста просто не будет.
 */
function readMessage(error: unknown): string | undefined {
  if (typeof error === 'string')
    return error
  if (typeof error !== 'function')
    return undefined

  try {
    const produced = (error as (ctx: unknown) => unknown)({})
    return typeof produced === 'string' ? produced : undefined
  }
  catch {
    return undefined
  }
}

export function shapeOf(schema: ZodLike): Record<string, ZodLike> | undefined {
  const def = defOf(schema)
  const shape = typeof def.shape === 'function'
    ? (def.shape as () => unknown)()
    : def.shape

  return shape && typeof shape === 'object' ? shape as Record<string, ZodLike> : undefined
}

/**
 * Схема значения свободного ключа: `.catchall(...)`, а в v4 ещё и `looseObject`,
 * который кладёт в `catchall` схему `unknown`.
 *
 * `never` отсеивается: им v3 и v4 обозначают «лишних ключей нет».
 */
export function catchallOf(schema: ZodLike): ZodLike | undefined {
  const catchall = defOf(schema).catchall

  return isZodSchema(catchall) && typeNameOf(catchall) !== 'never' ? catchall : undefined
}

/** v3 объявляет свободные ключи флагом `passthrough`, а не схемой значения. */
export function passesUnknownKeys(schema: ZodLike): boolean {
  return defOf(schema).unknownKeys === 'passthrough'
}

export function elementOf(schema: ZodLike): ZodLike | undefined {
  const def = defOf(schema)

  for (const candidate of [def.element, def.valueType, def.items]) {
    if (isZodSchema(candidate))
      return candidate
  }

  return undefined
}

export function optionsOf(schema: ZodLike): unknown[] | undefined {
  const def = defOf(schema)
  const values = def.values ?? def.entries ?? def.options

  if (Array.isArray(values))
    return values as unknown[]
  // v4 держит варианты объектом `{ admin: 'admin' }`, v3 — массивом.
  if (values && typeof values === 'object')
    return Object.values(values as Record<string, unknown>)

  return undefined
}

export function defaultOf(schema: ZodLike): unknown {
  const def = defOf(schema)
  const value = def.defaultValue

  return typeof value === 'function' ? (value as () => unknown)() : value
}

export function descriptionOf(schema: ZodLike): string | undefined {
  const direct = schema.description
  if (typeof direct === 'string')
    return direct

  const def = defOf(schema)
  return typeof def.description === 'string' ? def.description : undefined
}

/** Метаданные `.meta({...})` из v4 и `.describe()`-совместимые аннотации. */
export function metaOf(schema: ZodLike): Record<string, unknown> | undefined {
  const meta = (schema as { meta?: () => unknown }).meta
  if (typeof meta !== 'function')
    return undefined

  const value = meta.call(schema)
  return value && typeof value === 'object' ? value as Record<string, unknown> : undefined
}

/** Поле-дискриминатор объединения (`z.discriminatedUnion`). */
export function discriminatorOf(schema: ZodLike): string | undefined {
  const value = defOf(schema).discriminator

  return typeof value === 'string' ? value : undefined
}
