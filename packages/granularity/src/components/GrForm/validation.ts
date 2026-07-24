/**
 * Движок валидации `GrForm` — чистый (без Vue/i18n), тестируется изолированно.
 *
 * Правило описывает набор проверок значения поля; `runFieldRules` прогоняет их по
 * порядку и возвращает первое сообщение об ошибке (или `undefined`, если валидно).
 * Сообщения резолвит потребитель (компонент) через `resolveMessage` — так i18n и
 * дефолтные тексты остаются в компоненте, а движок ничего о них не знает.
 */

export type GrFormTrigger = 'blur' | 'change' | 'submit'

/** Результат кастомного валидатора: `true`/void — ок; `false` — ошибка (дефолт-текст); строка — текст ошибки. */
export type GrFormValidatorResult = boolean | string | void

export interface GrFormRule {
  /** Значение обязательно (не пустое). */
  required?: boolean
  /** Готовый текст ошибки — перекрывает дефолтное сообщение любой проверки этого правила. */
  message?: string
  /** Минимум: длина для строки/массива, значение для числа. */
  min?: number
  /** Максимум: длина для строки/массива, значение для числа. */
  max?: number
  /** Точная длина/значение. */
  len?: number
  /** Регулярное выражение (проверяется по `String(value)`). */
  pattern?: RegExp
  /** Встроенный тип-валидатор. */
  type?: 'email' | 'url'
  /** Кастомный (в т.ч. async) валидатор. Второй аргумент — весь `model`. */
  validator?: (value: unknown, model: Record<string, unknown>) => GrFormValidatorResult | Promise<GrFormValidatorResult>
  /** Когда правило срабатывает. По умолчанию — на любом триггере (blur/change/submit). */
  trigger?: GrFormTrigger | GrFormTrigger[]
}

export type GrFormRules = Record<string, GrFormRule | GrFormRule[]>

/** Вид сработавшей проверки — ключ для дефолтного i18n-сообщения. */
export type GrFormRuleFailure = 'required' | 'min' | 'max' | 'len' | 'pattern' | 'email' | 'url' | 'invalid'

export type GrFormMessageResolver = (
  kind: GrFormRuleFailure,
  rule: GrFormRule,
  params: Record<string, unknown>,
) => string

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function isUrl(value: string): boolean {
  return URL.canParse(value)
}

/** Пустое значение: `null`/`undefined`/пустая (или пробельная) строка/пустой массив. */
export function isEmpty(value: unknown): boolean {
  if (value == null) return true
  if (typeof value === 'string') return value.trim() === ''
  if (Array.isArray(value)) return value.length === 0
  return false
}

/** Мера значения для min/max/len: число → само значение, строка/массив → длина. */
function measure(value: unknown): number {
  if (typeof value === 'number') return value
  if (typeof value === 'string') return value.length
  if (Array.isArray(value)) return value.length
  return Number(value)
}

/** Достаёт значение из объекта по dot-path (`address.city`). */
export function getByPath(obj: Record<string, unknown>, path: string): unknown {
  if (!path.includes('.')) return obj[path]
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object') return (acc as Record<string, unknown>)[key]
    return undefined
  }, obj)
}

/** Записывает значение в объект по dot-path (создаёт промежуточные объекты). */
export function setByPath(obj: Record<string, unknown>, path: string, value: unknown): void {
  const keys = path.split('.')
  const last = keys.pop() as string
  let target = obj
  for (const key of keys) {
    if (!target[key] || typeof target[key] !== 'object') target[key] = {}
    target = target[key] as Record<string, unknown>
  }
  target[last] = value
}

/** Нормализует правило(а) поля в массив. */
export function toRuleArray(rules: GrFormRule | GrFormRule[] | undefined): GrFormRule[] {
  if (!rules) return []
  return Array.isArray(rules) ? rules : [rules]
}

function ruleMatchesTrigger(rule: GrFormRule, trigger?: GrFormTrigger): boolean {
  if (!trigger) return true // полная валидация (validate()) — все правила
  if (!rule.trigger) return true // правило без триггера срабатывает на любом
  const triggers = Array.isArray(rule.trigger) ? rule.trigger : [rule.trigger]
  return triggers.includes(trigger)
}

/** Правила поля, применимые для данного триггера (undefined = все). */
export function rulesForTrigger(rules: GrFormRule[], trigger?: GrFormTrigger): GrFormRule[] {
  return rules.filter(rule => ruleMatchesTrigger(rule, trigger))
}

/** Есть ли среди правил `required` (для маркера обязательности в поле). */
export function rulesRequired(rules: GrFormRule[]): boolean {
  return rules.some(rule => rule.required === true)
}

/**
 * Прогоняет правила по порядку, возвращает первое сообщение об ошибке или `undefined`.
 * Пустое необязательное значение проходит все проверки (кроме `required`).
 */
export async function runFieldRules(
  value: unknown,
  rules: GrFormRule[],
  model: Record<string, unknown>,
  resolveMessage: GrFormMessageResolver,
): Promise<string | undefined> {
  for (const rule of rules) {
    const empty = isEmpty(value)

    if (rule.required && empty) return resolveMessage('required', rule, {})
    // Необязательное пустое значение — остальные проверки этого правила пропускаем.
    if (empty) continue

    if (rule.type === 'email' && !EMAIL_RE.test(String(value))) return resolveMessage('email', rule, {})
    if (rule.type === 'url' && !isUrl(String(value))) return resolveMessage('url', rule, {})

    if (rule.len != null && measure(value) !== rule.len) return resolveMessage('len', rule, { len: rule.len })
    if (rule.min != null && measure(value) < rule.min) return resolveMessage('min', rule, { min: rule.min })
    if (rule.max != null && measure(value) > rule.max) return resolveMessage('max', rule, { max: rule.max })

    if (rule.pattern && !rule.pattern.test(String(value))) return resolveMessage('pattern', rule, {})

    if (rule.validator) {
      const result = await rule.validator(value, model)
      if (result === false) return rule.message ?? resolveMessage('invalid', rule, {})
      if (typeof result === 'string') return result
    }
  }

  return undefined
}
