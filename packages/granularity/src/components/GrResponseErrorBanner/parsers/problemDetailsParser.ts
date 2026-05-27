import type { ResponseErrorParser } from '../responseError.types'

/**
 * Парсер RFC 7807 «Problem Details for HTTP APIs»:
 *
 * ```json
 * { "type": "https://example.com/probs/out-of-credit",
 *   "title": "You do not have enough credit.",
 *   "status": 403,
 *   "detail": "Your current balance is 30.",
 *   "errors": { "balance": ["..."] } }
 * ```
 *
 * Активируется, если есть `body.type` + `body.title`, либо
 * Content-Type заголовка `application/problem+json`. Берёт `title` как
 * `message`, `detail` — в `details[0]`, status — в `status`.
 */
export const problemDetailsParser: ResponseErrorParser = (ctx) => {
  const body = ctx.body
  if (!body || typeof body !== 'object' || Array.isArray(body)) return null

  const data = body as { type?: unknown, title?: unknown, detail?: unknown, status?: unknown }
  const isProblemContentType = ctx.headers?.['content-type']?.includes('application/problem+json')
  const hasShape = typeof data.title === 'string' && (typeof data.type === 'string' || typeof data.status === 'number')

  if (!isProblemContentType && !hasShape) return null

  const message = typeof data.title === 'string' ? data.title : ctx.texts.unknownMessage
  const details: string[] = []
  if (typeof data.detail === 'string' && data.detail) details.push(data.detail)

  const status = typeof data.status === 'number' ? data.status : ctx.status

  return {
    message,
    details: details.length ? details : undefined,
    status,
  }
}
