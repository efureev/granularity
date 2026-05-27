import type { ResponseErrorParser } from '../responseError.types'

/**
 * Финальный фолбэк-парсер. Достаёт хоть какое-нибудь человекочитаемое
 * сообщение, чтобы баннер не был пустым.
 *
 * Источники (по приоритету):
 * 1. `ctx.body` — если строка ⇒ message,
 * 2. `ctx.body[messageKey]` (default `'message'`),
 * 3. `ctx.body.error` (строка),
 * 4. `ctx.raw.message` (для голых `Error`).
 *
 * Не выставляет `kind` — оставляет на усмотрение классификатора.
 * Использует ключ `messageKey` из `ctx.meta._messageKey`, если задан.
 */
export const plainMessageParser: ResponseErrorParser = (ctx) => {
  const messageKey = (ctx.meta._messageKey as string | undefined) || 'message'

  if (typeof ctx.body === 'string' && ctx.body.trim()) {
    return { message: ctx.body }
  }

  if (ctx.body && typeof ctx.body === 'object') {
    const data = ctx.body as Record<string, unknown>
    const fromKey = data[messageKey]
    if (typeof fromKey === 'string' && fromKey) return { message: fromKey }
    if (typeof data.error === 'string' && data.error) return { message: data.error }
  }

  if (ctx.raw instanceof Error && ctx.raw.message) {
    return { message: ctx.raw.message }
  }

  return null
}
