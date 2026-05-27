import type { ResponseErrorParser } from '../responseError.types'

/**
 * Распознаёт отмену запроса клиентом.
 *
 * Триггеры:
 * - `ctx.isAbort === true` (выставляется `normalizeError` для `AbortError`,
 *   axios `isCancel`/`ERR_CANCELED`, xhr `status === 0 && readyState === 4`).
 *
 * Возвращает `kind: 'aborted'` и `stop: true` — другие парсеры пропускаются,
 * чтобы случайный `status === 0` не интерпретировался как сетевая ошибка.
 *
 * По умолчанию `aborted` показывается info-плашкой; чтобы скрыть совсем —
 * добавьте `'aborted'` в `autoHideKinds`.
 */
export const abortErrorParser: ResponseErrorParser = (ctx) => {
  if (!ctx.isAbort) return null
  return {
    kind: 'aborted',
    message: ctx.texts.abortedMessage,
    stop: true,
  }
}
