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
): string {
  const key = issue.i18nKey ?? fileValidationI18nKey(issue.code)

  // Числа уходят в перевод как есть. Форматировать их — работа переводчика
  // приложения: у него есть локаль и свои правила, а вторая реализация `Intl`
  // внутри UI-библиотеки однажды разошлась бы с ней в мелочах.
  return t(key, issue.message, issue.i18nParams)
}
