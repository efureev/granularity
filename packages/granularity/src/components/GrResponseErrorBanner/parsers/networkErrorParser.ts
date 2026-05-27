import type { ResponseErrorParser } from '../responseError.types'

/**
 * Распознаёт транспортные ошибки **без ответа сервера**: отсутствие интернета,
 * DNS-фейл, CORS-preflight, fetch `TypeError('Failed to fetch')`,
 * axios `ERR_NETWORK`/`ECONNABORTED`.
 *
 * Триггеры:
 * - `ctx.isNetwork === true` (выставлено `normalizeError`),
 * - либо нет ни `status`, ни `body`, ни признака отмены, но есть исходная
 *   ошибка с `code === 'ERR_NETWORK'` / `message ~ /network|fetch/i/`.
 *
 * Возвращает `kind: 'network'` и `stop: true`.
 */
export const networkErrorParser: ResponseErrorParser = (ctx) => {
  if (ctx.isAbort) return null

  if (ctx.isNetwork) {
    return {
      kind: 'network',
      message: ctx.texts.networkMessage,
      stop: true,
    }
  }

  // Эвристика для случаев, когда normalizeError не пометил, но статус-кода нет.
  if (typeof ctx.status !== 'number' && ctx.body == null && ctx.raw && typeof ctx.raw === 'object') {
    const r = ctx.raw as { code?: string, message?: string, name?: string }
    if (r.code === 'ERR_NETWORK' || (typeof r.message === 'string' && /network|failed to fetch/i.test(r.message))) {
      return {
        kind: 'network',
        message: ctx.texts.networkMessage,
        stop: true,
      }
    }
  }

  return null
}
