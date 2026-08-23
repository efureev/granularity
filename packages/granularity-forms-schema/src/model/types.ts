/**
 * Нейтральная модель схемы.
 *
 * Модуль намеренно без единого импорта — ни Vue, ни ядра, ни схемных библиотек.
 * Адаптеры приводят к нему чужую схему, рендерер и компилятор правил знают
 * только его. От этого зависит, впишется ли третий адаптер (valibot, OpenAPI,
 * генератор на бэкенде) без переделки пакета.
 *
 * Отсюда же два неочевидных решения: `pattern` хранится **строкой**, а не
 * `RegExp`, а `date` — вид значения, а не тип. Модель обязана пережить
 * `JSON.stringify` → `JSON.parse`: её отдают с сервера и кладут в кеш.
 */

export const GR_SCHEMA_MODEL_VERSION = 1 as const

/** Вид значения. `enum` — не вид, а признак: у узла заполнен `options`. */
export type GrSchemaKind
  = | 'string'
    | 'number'
    | 'boolean'
  /** Значение-`Date` в рантайме. Строковые даты — `string` + `format`. */
    | 'date'
    | 'file'
    | 'object'
    | 'array'
  /** Не сводится к `enum`: объединение объектов по дискриминатору. */
    | 'union'
  /** Адаптер не разобрал узел. Рисуется только на чтение и с предупреждением. */
    | 'unknown'

/**
 * Семантика значения.
 *
 * Union открытый: `format: 'iban'` от чужого бэкенда обязан быть легальным, —
 * закрытый список потребовал бы правки пакета ради каждого нового формата.
 */
export type GrSchemaFormat
  = | 'email' | 'url' | 'uri' | 'uuid' | 'tel' | 'password' | 'multiline' | 'slug'
    | 'date' | 'date-time' | 'time' | 'duration'
    | 'color' | 'color-alpha' | 'binary' | 'ipv4' | 'ipv6' | 'hostname' | 'json'
    | (string & {})

export interface GrSchemaOption {
  value: string | number | boolean
  label: string
  description?: string
  disabled?: boolean
  /** Группа опций — ложится на группы `GrSelect`. */
  group?: string
}

/**
 * Ограничения значения.
 *
 * `min`/`max`/`len` намеренно значат разное в зависимости от `kind`: у числа —
 * величину, у строки и массива — длину. Так устроен `GrFormRule` ядра
 * (`measure()` сам различает по типу значения), и компилятор переводит одно в
 * другое без ветвлений.
 */
export interface GrSchemaConstraints {
  min?: number
  max?: number
  len?: number
  exclusiveMin?: number
  exclusiveMax?: number
  /** `multipleOf` / шаг степпера. */
  step?: number
  integer?: boolean
  /** Источник регулярки строкой — модель обязана пережить JSON. */
  pattern?: string
  patternFlags?: string
  uniqueItems?: boolean
  /** Границы дат в ISO — уезжают в `min`/`max` пикера. */
  minDate?: string
  maxDate?: string
  accept?: string[]
  maxSize?: number
  maxFiles?: number
}

export interface GrSchemaNodeBase {
  /** Шаблонный путь от корня: `user.address.city`, `items.*.price`. Корень — ''. */
  path: string
  /** Ключ в родителе. У элемента массива — `*`. */
  key: string
  kind: GrSchemaKind
  format?: GrSchemaFormat
  title?: string
  description?: string
  placeholder?: string
  required: boolean
  nullable: boolean
  readOnly: boolean
  /** Значение уходит на сервер, но не приходит с него (пароль). */
  writeOnly: boolean
  deprecated: boolean
  default?: unknown
  /** Единственное допустимое значение (`z.literal`, `const`). */
  const?: unknown
  examples?: unknown[]
  /** Заполнено — узел рисуется выбором, а не вводом. */
  options?: GrSchemaOption[]
  constraints: GrSchemaConstraints
  /**
   * У узла остались проверки, не выразимые моделью, — компилятор навесит на
   * него резидуальное правило. Флаг, а не догадка: иначе полную проверку схемой
   * пришлось бы вешать на все поля разом.
   */
  residual: boolean
  /** `x-*`, `.meta()` — для своих рендереров и `uiSchema`. */
  annotations?: Record<string, unknown>
}

export interface GrSchemaScalarNode extends GrSchemaNodeBase {
  kind: 'string' | 'number' | 'boolean' | 'date' | 'file' | 'unknown'
}

export interface GrSchemaObjectNode extends GrSchemaNodeBase {
  kind: 'object'
  fields: GrSchemaNode[]
  /** Разрешены ли ключи сверх описанных (`additionalProperties`, `catchall`). */
  additional: boolean
  /**
   * Схема значения свободного ключа. Есть — форма рисует пары «ключ — значение»
   * этим узлом; нет — свободные ключи разрешены, но формой не вводятся.
   */
  additionalValue?: GrSchemaNode
}

export interface GrSchemaArrayNode extends GrSchemaNodeBase {
  kind: 'array'
  /** Узел элемента: `key === '*'`, `path === '<array>.*'`. */
  item: GrSchemaNode
  /** Кортеж фиксированной длины (`z.tuple`, `prefixItems`). */
  tuple?: GrSchemaNode[]
}

export interface GrSchemaUnionNode extends GrSchemaNodeBase {
  kind: 'union'
  /** Поле-дискриминатор внутри вариантов. Нет — узел уходит в резидуал. */
  discriminator?: string
  variants: GrSchemaObjectNode[]
}

export type GrSchemaNode
  = | GrSchemaScalarNode
    | GrSchemaObjectNode
    | GrSchemaArrayNode
    | GrSchemaUnionNode

/** Проблема, найденная полной проверкой по схеме. */
export interface GrSchemaIssue {
  /** Нормализованный инстанс-путь (`items.0.name`). Пусто — проблема формы целиком. */
  path: string
  message: string
  /** Машинный код (`too_small`, `custom`) — для своих текстов. */
  code?: string
}

export type GrSchemaValidateFn = (value: unknown) => GrSchemaIssue[] | Promise<GrSchemaIssue[]>

/**
 * Что адаптер не смог разобрать.
 *
 * Списком, а не молчанием: непонятый узел иначе превращается в поле, которое
 * выглядит рабочим и не проверяет ничего.
 */
export interface GrSchemaWarning {
  path: string
  code: 'unsupported-node' | 'unresolved-ref' | 'depth-exceeded' | 'lossy-constraint'
  message: string
}

export interface GrSchemaModel {
  version: typeof GR_SCHEMA_MODEL_VERSION
  /** Имя адаптера — в предупреждениях и отладке. */
  adapter: string
  root: GrSchemaObjectNode
  /** Полная проверка чужой схемой. Нет — резидуального яруса нет вовсе. */
  validate?: GrSchemaValidateFn
  warnings: GrSchemaWarning[]
}

export interface GrSchemaParseOptions {
  /** Глубина обхода: защита от рекурсивных схем. */
  maxDepth?: number
  /** Считать поля обязательными, пока схема не сказала обратного. */
  requiredByDefault?: boolean
  /** Префикс читаемых аннотаций; `false` — не читать вовсе. */
  annotationPrefix?: string | false
  /** Готовая полная проверка (скомпилированный Ajv, `safeParse`). */
  validate?: GrSchemaValidateFn
}

export interface GrSchemaAdapter<TSchema = unknown> {
  name: string
  /** Дак-типинг: по нему форма подбирает адаптер под переданную схему. */
  supports: (schema: unknown) => schema is TSchema
  /**
   * Разбор объявлен **методом**, а не свойством-функцией, намеренно: методы в
   * TypeScript проверяются бивариантно, и `GrSchemaAdapter<JsonSchemaDocument>`
   * ложится в список `GrSchemaAdapter[]`. Со свойством потребитель не смог бы
   * написать `:adapters="[zodAdapter, jsonSchemaAdapter]"` — а это ровно то,
   * ради чего адаптеры разведены отдельными subpath.
   *
   * Безопасно потому, что `parse` вызывается только после `supports`.
   */
  // eslint-disable-next-line ts/method-signature-style
  parse(schema: TSchema, options?: GrSchemaParseOptions): GrSchemaModel
}

/**
 * Развёрнутое поле: узел схемы в конкретном месте модели данных.
 *
 * Два пути — не избыточность, а разделение, на котором держится весь пакет.
 * `templatePath` адресует **описание** (ключ в `uiSchema`, реестре, имени
 * слота), `name` — **данные** (`GrFormField name`, ключ в `GrFormRules`).
 * Их смешение — главный источник багов в генераторах форм.
 */
export interface GrSchemaFieldInstance {
  node: GrSchemaNode
  /** Инстанс-путь: `items.0.name`. */
  name: string
  /** Шаблонный путь: `items.*.name`. */
  templatePath: string
  /** Индексы массивов на пути, снаружи внутрь. */
  indices: number[]
  /** Инстанс-путь контейнера. */
  parent: string
  depth: number
  /** Лист рисуется контролом; контейнер — секцией или повторителем. */
  leaf: boolean
}
