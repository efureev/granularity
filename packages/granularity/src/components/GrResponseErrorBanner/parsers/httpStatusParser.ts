import type { ResponseErrorParser } from '../responseError.types'

/**
 * Базовая классификация по HTTP-статусу.
 *
 * Правила:
 * - `400` / `422` ⇒ `kind: 'validation'`,
 * - остальные `4xx` ⇒ `kind: 'client'`,
 * - `>= 500` ⇒ `kind: 'server'`.
 *
 * Не использует `stop` — даёт более специализированным парсерам
 * (Laravel/JSON:API/RFC 7807) уточнить сообщение и `fieldErrors`.
 *
 * `message` **не** заполняет: общий текст по `kind` — работа классификатора,
 * который помечает такое сообщение `isFallbackMessage`. Только по этому флагу
 * баннер вправе заменить текст переводом.
 */
export const httpStatusParser: ResponseErrorParser = (ctx) => {
  const status = ctx.status
  if (typeof status !== 'number') return null

  if (status >= 500) {
    return { kind: 'server', status }
  }
  if (status === 400 || status === 422) {
    return { kind: 'validation', status }
  }
  if (status >= 400) {
    return { kind: 'client', status }
  }
  return null
}
