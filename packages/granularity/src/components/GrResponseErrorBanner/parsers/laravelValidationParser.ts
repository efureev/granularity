import type { ResponseErrorFieldError, ResponseErrorParser } from '../responseError.types'

/**
 * Парсит Laravel-формат ответа об ошибке валидации:
 *
 * ```json
 * { "message": "The given data was invalid.",
 *   "errors": { "file": ["The file is required."], "amount": ["..."] } }
 * ```
 *
 * Активируется при наличии `ctx.body.errors` как plain-объекта (значения —
 * массив строк или строка). Если есть `fieldErrors`, повышает `kind` до
 * `validation` независимо от статуса (полезно, когда сервер прислал 200/4xx
 * без 422). `message` берётся из `body.message` / `body.error`.
 */
export const laravelValidationParser: ResponseErrorParser = (ctx) => {
  const body = ctx.body
  if (!body || typeof body !== 'object' || Array.isArray(body)) return null

  const data = body as Record<string, unknown>
  const errors = data.errors
  if (!errors || typeof errors !== 'object' || Array.isArray(errors)) return null

  const fieldErrors: ResponseErrorFieldError[] = []
  for (const [field, raw] of Object.entries(errors as Record<string, unknown>)) {
    const messages = Array.isArray(raw)
      ? raw.filter((m): m is string => typeof m === 'string')
      : typeof raw === 'string' ? [raw] : []
    if (messages.length) fieldErrors.push({ field, messages })
  }

  if (!fieldErrors.length) return null

  const message = (typeof data.message === 'string' && data.message)
    || (typeof data.error === 'string' && data.error)
    || ctx.texts.validationMessage

  const details = fieldErrors.flatMap(fe => fe.messages)

  return {
    kind: 'validation',
    message,
    details,
    fieldErrors,
  }
}
