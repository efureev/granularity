import type { ResponseErrorFieldError, ResponseErrorParser } from '../responseError.types'

/**
 * Парсер JSON:API-стиля:
 *
 * ```json
 * { "errors": [
 *     { "status": "422", "title": "Invalid Attribute",
 *       "detail": "Email is required.",
 *       "source": { "pointer": "/data/attributes/email" } }
 *   ] }
 * ```
 *
 * Активируется, когда `ctx.body.errors` — массив объектов с `title`/`detail`.
 * Поле извлекается из последнего сегмента `source.pointer`. Все `detail`
 * собираются в `details`, первый `title` — в `message`.
 */
export const jsonApiErrorParser: ResponseErrorParser = (ctx) => {
  const body = ctx.body
  if (!body || typeof body !== 'object') return null

  const errors = (body as { errors?: unknown }).errors
  if (!Array.isArray(errors) || errors.length === 0) return null

  // Эвристика: первый элемент должен иметь title/detail/source — иначе это не JSON:API
  const first = errors[0]
  if (!first || typeof first !== 'object') return null
  const has = (key: string) => key in (first as object)
  if (!has('title') && !has('detail') && !has('source')) return null

  const fieldErrorsMap = new Map<string, string[]>()
  const details: string[] = []
  let message: string | undefined

  for (const e of errors) {
    if (!e || typeof e !== 'object') continue
    const eo = e as { title?: unknown, detail?: unknown, source?: { pointer?: unknown } }
    const text = (typeof eo.detail === 'string' && eo.detail) || (typeof eo.title === 'string' && eo.title) || ''
    if (!text) continue
    if (!message && typeof eo.title === 'string') message = eo.title

    const pointer = typeof eo.source?.pointer === 'string' ? eo.source.pointer : ''
    const field = pointer ? pointer.split('/').filter(Boolean).pop() : undefined

    if (field) {
      const list = fieldErrorsMap.get(field) ?? []
      list.push(text)
      fieldErrorsMap.set(field, list)
    }
    details.push(text)
  }

  if (!details.length) return null

  const fieldErrors: ResponseErrorFieldError[] = Array.from(fieldErrorsMap, ([field, messages]) => ({ field, messages }))

  const kind = fieldErrors.length ? 'validation' : undefined

  return {
    kind,
    message: message || (kind === 'validation' ? ctx.texts.validationMessage : ctx.texts.clientMessage),
    details,
    fieldErrors: fieldErrors.length ? fieldErrors : undefined,
  }
}
