import { formatFileSize } from './formatFileSize'
import type { FileValidationIssue, FileValidationIssueCode } from './types'

/**
 * Неймспейс ключей перевода встроенных валидаторов.
 *
 * Ключ выводится из `code`, поэтому новый встроенный валидатор получает перевод
 * автоматически — достаточно завести строку в `i18n/locales/*.json`.
 */
export const FILE_VALIDATION_I18N_NAMESPACE = 'gr.fileValidation'

export function fileValidationI18nKey(code: FileValidationIssueCode): string {
  return `${FILE_VALIDATION_I18N_NAMESPACE}.${code}`
}

/**
 * Текст ошибки валидации для показа пользователю.
 *
 * Порядок: явный `i18nKey` → ключ, выведенный из `code` → английский `message`.
 *
 * `i18nKey` существует отдельно от `code` не для симметрии: `code` — это ветка
 * для обработчика на стороне потребителя, и два разных по смыслу сообщения
 * могут делить один `code` (так у `allowedMimeTypesValidator`: обычный
 * запрещённый тип и fallback-тип — оба `mimeType`). Формулировка при этом нужна
 * разная, и различает их именно ключ.
 *
 * `message` остаётся обязательным полем типа и работает как безопасный fallback:
 * валидатор потребителя, ничего не знающий про i18n, продолжает показываться.
 */
export function resolveFileValidationMessage(
  issue: FileValidationIssue,
  t: (key: string, fallback: string, params?: Record<string, unknown>) => string,
  locale?: string,
): string {
  const key = issue.i18nKey ?? fileValidationI18nKey(issue.code)

  return t(key, issue.message, withReadableSizes(issue.i18nParams, t, locale))
}

/**
 * К байтам добавляются те же размеры словами: `maxSize`, `fileSize`, `totalSize`.
 *
 * Сообщение видит пользователь, а `10485760 bytes` — язык разработчика. Байты
 * при этом остаются в параметрах под прежними именами: на них опираются
 * переводы приложений, написанные раньше.
 */
function withReadableSizes(
  params: Record<string, unknown> | undefined,
  t: (key: string, fallback: string, params?: Record<string, unknown>) => string,
  locale: string | undefined,
): Record<string, unknown> | undefined {
  if (!params)
    return params

  const readable = (value: unknown): string | undefined =>
    typeof value === 'number' && Number.isFinite(value) ? formatFileSize(value, { t, locale }) : undefined

  return {
    ...params,
    maxSize: readable(params.maxBytes),
    fileSize: readable(params.size),
    totalSize: readable(params.total),
  }
}
