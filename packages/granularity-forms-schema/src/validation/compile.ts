import type { GrFormRule, GrFormRules, GrFormTrigger } from '@feugene/granularity'

import type { GrSchemaFieldInstance, GrSchemaNode } from '../model'

import { KNOWN_FORMATS, toSafeRegExp } from './formats'

export type GrSchemaRuleTier = 'declarative' | 'local' | 'residual'

export type GrSchemaTranslate = (
  key: string,
  fallback: string,
  params?: Record<string, unknown>,
) => string

export interface GrSchemaRuleCompilerOptions {
  t?: GrSchemaTranslate
  /** Сообщение резидуального яруса по инстанс-пути из последнего прогона схемы. */
  residualMessageAt?: (name: string) => string | undefined
  /** Когда срабатывает резидуальное правило. Полная проверка схемы дорога. */
  residualTrigger?: GrFormTrigger | GrFormTrigger[]
  /** Отключить ярусы — для отладки расхождения «схема против формы». */
  tiers?: readonly GrSchemaRuleTier[]
  /** Свои форматы поверх известных. */
  formats?: Partial<Record<string, { pattern?: string, patternFlags?: string, validate?: (v: unknown) => boolean, messageKey?: string, fallback?: string }>>
  /**
   * Числовая модель гарантирована: значение действительно `number`, а не строка
   * из сырого `<input>`. Влияет на то, чем выражаются границы — см. ниже.
   */
  numericModelAt?: (instance: GrSchemaFieldInstance) => boolean
  /** Последний хук: подправить готовый набор правил поля. */
  decorate?: (rules: GrFormRule[], instance: GrSchemaFieldInstance) => GrFormRule[]
}

const DEFAULT_TIERS: readonly GrSchemaRuleTier[] = ['declarative', 'local', 'residual']

/**
 * Включён ли ярус. Дефолт живёт здесь и только здесь.
 *
 * Спрашивает не только компилятор: форма гоняет полную проверку схемой на
 * отправке, и выключаться это обязано тем же `tiers`, а не вторым пропом.
 */
export function includesTier(options: GrSchemaRuleCompilerOptions | undefined, tier: GrSchemaRuleTier): boolean {
  return (options?.tiers ?? DEFAULT_TIERS).includes(tier)
}

function translate(options: GrSchemaRuleCompilerOptions, key: string, fallback: string, params?: Record<string, unknown>): string {
  return options.t ? options.t(key, fallback, params) : interpolate(fallback, params)
}

function interpolate(text: string, params?: Record<string, unknown>): string {
  if (!params) return text
  return text.replace(/\{(\w+)\}/g, (match, key: string) => (key in params ? String(params[key]) : match))
}

/**
 * Числовая граница локальным валидатором.
 *
 * Нужна там, где значение может оказаться строкой: `measure()` ядра меряет
 * строку **длиной**, и `min: 18` на значении `"25"` дало бы «минимум 18» —
 * потому что символов два. Ошибка выглядит как поломка валидации на валидном
 * вводе и ищется долго.
 */
function numericBound(
  kind: 'min' | 'max' | 'exclusiveMin' | 'exclusiveMax',
  bound: number,
  message: string,
): GrFormRule {
  return {
    message,
    validator: (value) => {
      if (value === null || value === undefined || value === '') return true

      const numeric = typeof value === 'number' ? value : Number(value)
      if (Number.isNaN(numeric)) return true

      switch (kind) {
        case 'min': return numeric >= bound
        case 'max': return numeric <= bound
        case 'exclusiveMin': return numeric > bound
        case 'exclusiveMax': return numeric < bound
      }
    },
  }
}

function declarativeRule(node: GrSchemaNode, options: GrSchemaRuleCompilerOptions, numericModel: boolean): GrFormRule | undefined {
  const rule: GrFormRule = {}
  const { constraints: c } = node

  if (node.format === 'email') rule.type = 'email'
  else if (node.format === 'url' || node.format === 'uri') rule.type = 'url'

  const formatSpec = node.format
    ? { ...KNOWN_FORMATS[node.format], ...options.formats?.[node.format] }
    : undefined

  if (!rule.type && formatSpec?.pattern) {
    rule.pattern = toSafeRegExp(formatSpec.pattern, formatSpec.patternFlags)
    rule.message = translate(options, formatSpec.messageKey ?? 'grForms.format.invalid', formatSpec.fallback ?? 'Invalid format')
  }
  else if (c.pattern) {
    rule.pattern = toSafeRegExp(c.pattern, c.patternFlags)
  }

  // Границы строки и массива меряются длиной — ровно так же, как их меряет ядро.
  // Числовые границы уходят сюда только когда модель точно числовая.
  const measurable = node.kind === 'string' || node.kind === 'array' || (node.kind === 'number' && numericModel)
  if (measurable) {
    if (c.len !== undefined) rule.len = c.len
    if (c.min !== undefined) rule.min = c.min
    if (c.max !== undefined) rule.max = c.max
  }

  if (node.kind === 'file' && (c.accept || c.maxSize || c.maxFiles)) {
    rule.file = {
      ...(c.accept ? { accept: c.accept.join(',') } : {}),
      ...(c.maxSize ? { maxSizeBytes: c.maxSize } : {}),
      ...(c.maxFiles ? { maxCount: c.maxFiles } : {}),
    }
  }

  return Object.keys(rule).length > 0 ? rule : undefined
}

function localRules(node: GrSchemaNode, options: GrSchemaRuleCompilerOptions, numericModel: boolean): GrFormRule[] {
  const rules: GrFormRule[] = []
  const { constraints: c } = node

  /**
   * Единственное допустимое значение — не `required`.
   *
   * Ядро не считает `false` пустым, поэтому «согласен с условиями» с `required`
   * пропустил бы снятый флажок. Это ровно тот класс проверок, ради которого
   * средний ярус и заведён.
   */
  if (node.const !== undefined) {
    rules.push({
      message: node.const === true
        ? translate(options, 'grForms.rule.mustBeTrue', 'This must be checked')
        : translate(options, 'grForms.rule.const', 'Value must be {value}', { value: String(node.const) }),
      validator: value => value === null || value === undefined || value === '' || value === node.const,
    })
  }

  if (node.kind === 'number') {
    if (c.integer) {
      rules.push({
        message: translate(options, 'grForms.rule.integer', 'Enter a whole number'),
        validator: (value) => {
          if (value === null || value === undefined || value === '') return true
          return Number.isInteger(typeof value === 'number' ? value : Number(value))
        },
      })
    }

    if (c.step !== undefined && c.step > 0) {
      rules.push({
        message: translate(options, 'grForms.rule.step', 'Value must be a multiple of {step}', { step: c.step }),
        validator: (value) => {
          if (value === null || value === undefined || value === '') return true
          const numeric = typeof value === 'number' ? value : Number(value)
          if (Number.isNaN(numeric)) return true
          // Через целые: 0.3 % 0.1 в двоичной арифметике даёт не ноль.
          const factor = 10 ** decimalPlaces(c.step!)
          return Math.round(numeric * factor) % Math.round(c.step! * factor) === 0
        },
      })
    }

    if (!numericModel) {
      if (c.min !== undefined)
        rules.push(numericBound('min', c.min, translate(options, 'grForms.rule.min', 'Minimum is {min}', { min: c.min })))
      if (c.max !== undefined)
        rules.push(numericBound('max', c.max, translate(options, 'grForms.rule.max', 'Maximum is {max}', { max: c.max })))
    }

    if (c.exclusiveMin !== undefined)
      rules.push(numericBound('exclusiveMin', c.exclusiveMin, translate(options, 'grForms.rule.exclusiveMin', 'Value must be greater than {min}', { min: c.exclusiveMin })))
    if (c.exclusiveMax !== undefined)
      rules.push(numericBound('exclusiveMax', c.exclusiveMax, translate(options, 'grForms.rule.exclusiveMax', 'Value must be less than {max}', { max: c.exclusiveMax })))
  }

  if (node.kind === 'array' && c.uniqueItems) {
    rules.push({
      message: translate(options, 'grForms.rule.unique', 'Values must not repeat'),
      validator: (value) => {
        if (!Array.isArray(value)) return true
        // Объекты сравниваются сериализацией: ссылочное равенство для строк
        // повторителя бессмысленно — две одинаково заполненные строки разные.
        const seen = (value as unknown[]).map(item =>
          (item !== null && typeof item === 'object' ? JSON.stringify(item) : item))
        return new Set(seen).size === seen.length
      },
    })
  }

  if (node.kind === 'date' || node.format === 'date' || node.format === 'date-time') {
    if (c.minDate) rules.push(dateBound('min', c.minDate, translate(options, 'grForms.rule.minDate', 'Not earlier than {date}', { date: c.minDate })))
    if (c.maxDate) rules.push(dateBound('max', c.maxDate, translate(options, 'grForms.rule.maxDate', 'Not later than {date}', { date: c.maxDate })))
  }

  const formatSpec = node.format
    ? { ...KNOWN_FORMATS[node.format], ...options.formats?.[node.format] }
    : undefined

  if (formatSpec?.validate) {
    const check = formatSpec.validate
    rules.push({
      message: translate(options, formatSpec.messageKey ?? 'grForms.format.invalid', formatSpec.fallback ?? 'Invalid format'),
      validator: value => (value === null || value === undefined || value === '' ? true : check(value)),
    })
  }

  return rules
}

function decimalPlaces(value: number): number {
  const text = String(value)
  const dot = text.indexOf('.')
  return dot === -1 ? 0 : text.length - dot - 1
}

function dateBound(kind: 'min' | 'max', bound: string, message: string): GrFormRule {
  const limit = Date.parse(bound)

  return {
    message,
    validator: (value) => {
      if (value === null || value === undefined || value === '') return true
      if (Number.isNaN(limit)) return true

      const time = value instanceof Date ? value.getTime() : Date.parse(String(value))
      if (Number.isNaN(time)) return true

      return kind === 'min' ? time >= limit : time <= limit
    },
  }
}

/**
 * Правило-заглушка для поля, у которого проверок не нашлось.
 *
 * `hasField` формы реализован как «у поля есть правила», поэтому поле без
 * единого правила к форме не привязано: оно не участвует в `validate()` и не
 * покажет ошибку, пришедшую из формы. Пустое правило ничего не проверяет, но
 * делает поле видимым — не оптимизировать.
 */
const SENTINEL_RULE: GrFormRule = {}

/** Правила одного поля, в порядке, который задаёт порядок сообщений. */
export function compileFieldRules(
  instance: GrSchemaFieldInstance,
  options: GrSchemaRuleCompilerOptions = {},
): GrFormRule[] {
  const tiers = options.tiers ?? DEFAULT_TIERS
  const { node } = instance
  const rules: GrFormRule[] = []
  const numericModel = options.numericModelAt?.(instance) ?? true

  if (node.required && tiers.includes('declarative'))
    rules.push({ required: true })

  if (tiers.includes('declarative')) {
    const rule = declarativeRule(node, options, numericModel)
    if (rule) rules.push(rule)
  }

  if (tiers.includes('local'))
    rules.push(...localRules(node, options, numericModel))

  if (node.residual && tiers.includes('residual') && options.residualMessageAt) {
    const messageAt = options.residualMessageAt
    rules.push({
      trigger: options.residualTrigger ?? 'submit',
      validator: () => messageAt(instance.name) ?? true,
    })
  }

  if (rules.length === 0) rules.push(SENTINEL_RULE)

  return options.decorate ? options.decorate(rules, instance) : rules
}

/**
 * Правила всей формы по развёрнутым полям.
 *
 * Ключ — инстанс-путь: именно его форма ждёт и в `rules`, и в `GrFormField name`.
 */
export function compileRules(
  instances: readonly GrSchemaFieldInstance[],
  options: GrSchemaRuleCompilerOptions = {},
): GrFormRules {
  const rules: GrFormRules = {}

  for (const instance of instances) {
    // Контейнеры правил не несут — кроме массива, у которого границы длины
    // проверяются на нём самом.
    if (!instance.leaf && instance.node.kind !== 'array') continue
    if (instance.node.kind === 'array' && !hasArrayRules(instance)) continue

    rules[instance.name] = compileFieldRules(instance, options)
  }

  return rules
}

function hasArrayRules(instance: GrSchemaFieldInstance): boolean {
  const { constraints: c } = instance.node
  return instance.node.required || c.min !== undefined || c.max !== undefined
    || c.len !== undefined || c.uniqueItems === true
}
