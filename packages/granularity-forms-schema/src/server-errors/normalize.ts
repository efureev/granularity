import { normalizeFieldPath } from '../model'

export interface GrFieldErrorMap {
  /** Ошибки по нормализованному инстанс-пути. */
  fields: Record<string, string[]>
  /** Сообщения, не относящиеся ни к какому полю. */
  form: string[]
}

export interface ToFieldErrorMapOptions {
  /** Псевдонимы: `{ email_address: 'email' }`. Единственный способ починить регистр. */
  aliases?: Record<string, string>
  /** Префиксы JSON Pointer, которые снимаются: `data`, `attributes`. */
  stripPrefixes?: string[]
}

function toMessages(value: unknown): string[] {
  if (typeof value === 'string') return [value]
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === 'string')

  return []
}

function record(source: unknown): Record<string, unknown> | undefined {
  return source && typeof source === 'object' && !Array.isArray(source)
    ? source as Record<string, unknown>
    : undefined
}

/**
 * Разбирает ответ сервера в карту ошибок по путям полей.
 *
 * Форматов три, и все живые: Laravel (`{ errors: { field: [...] } }`),
 * JSON:API (`{ errors: [{ source: { pointer } , detail }] }`) и RFC 7807
 * (`{ violations: [{ propertyPath, message }] }`). Плюс уже готовая карта —
 * её отдают, когда разбор сделан на стороне приложения.
 *
 * Функция без Vue: разбор чужого ответа тестируется без монтирования.
 */
export function toFieldErrorMap(source: unknown, options: ToFieldErrorMapOptions = {}): GrFieldErrorMap {
  const result: GrFieldErrorMap = { fields: {}, form: [] }
  const root = record(source)
  if (!root) {
    if (typeof source === 'string') result.form.push(source)
    return result
  }

  const put = (rawPath: string, messages: string[]): void => {
    if (messages.length === 0) return

    const normalized = normalizeFieldPath(rawPath, { stripPrefixes: options.stripPrefixes })
    const path = options.aliases?.[normalized] ?? options.aliases?.[rawPath] ?? normalized

    if (path === '') {
      result.form.push(...messages)
      return
    }

    result.fields[path] = [...(result.fields[path] ?? []), ...messages]
  }

  // Обёртка ответа: `{ data: { errors } }`, `{ response: { data: … } }`.
  const payload = record(root.data) ?? record(record(root.response)?.data) ?? root

  // Laravel и совместимые: карта «поле → сообщения».
  const errors = payload.errors ?? root.errors
  const errorMap = record(errors)
  if (errorMap && !Array.isArray(errors)) {
    for (const [key, value] of Object.entries(errorMap)) put(key, toMessages(value))
  }

  // JSON:API: список объектов с указателем на источник.
  if (Array.isArray(errors)) {
    for (const entry of errors) {
      const item = record(entry)
      if (!item) continue

      const pointer = record(item.source)?.pointer
      const message = toMessages(item.detail ?? item.title ?? item.message)
      put(typeof pointer === 'string' ? pointer : '', message)
    }
  }

  // RFC 7807 и Symfony: список нарушений.
  const violations = payload.violations ?? root.violations
  if (Array.isArray(violations)) {
    for (const entry of violations) {
      const item = record(entry)
      if (!item) continue

      const path = item.propertyPath ?? item.property ?? item.field
      put(typeof path === 'string' ? path : '', toMessages(item.message ?? item.title))
    }
  }

  // Сообщение уровня ответа: показывается сводкой, а не теряется.
  const message = payload.message ?? root.message ?? payload.detail ?? root.detail
  if (typeof message === 'string' && Object.keys(result.fields).length === 0)
    result.form.push(message)

  return result
}
