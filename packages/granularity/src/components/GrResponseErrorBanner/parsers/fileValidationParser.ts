import type { ResponseErrorParser } from '../responseError.types'

/**
 * Распознаёт `FileValidationError` от `GrFileUpload` (или совместимый по форме
 * объект). Не зависит от жёсткого импорта класса — определяет по `name`.
 *
 * Активируется, если `ctx.raw.name === 'FileValidationError'` и есть массив
 * `issues`/`errors` с полями `{ file?, code?, message }`.
 *
 * Возвращает `kind: 'validation'` и `stop: true` — это локальная клиентская
 * валидация, незачем дальше идти по HTTP-парсерам.
 */
export const fileValidationParser: ResponseErrorParser = (ctx) => {
  const raw = ctx.raw as
    | undefined
    | {
      name?: string
      message?: string
      issues?: Array<{ file?: { name?: string }, message?: unknown, code?: string }>
      errors?: Array<{ file?: { name?: string }, message?: unknown, code?: string }>
    }
  if (!raw || typeof raw !== 'object') return null
  if (raw.name !== 'FileValidationError') return null

  const list = raw.issues ?? raw.errors ?? []
  const details: string[] = []
  for (const it of list) {
    if (!it || typeof it !== 'object') continue
    const msg = typeof it.message === 'string' ? it.message : ''
    if (!msg) continue
    const fileName = it.file?.name
    details.push(fileName ? `${fileName}: ${msg}` : msg)
  }

  return {
    kind: 'validation',
    message: raw.message || ctx.texts.validationMessage,
    details: details.length ? details : undefined,
    stop: true,
  }
}
