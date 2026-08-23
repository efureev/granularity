export type FileValidationIssueCode
  = | 'accept'
    | 'mimeType'
    | 'extension'
    | 'maxCount'
    | 'maxFileSize'
    | 'maxTotalSize'
    | (string & {})

export type FileValidationIssue = {
  fileName?: string
  code: FileValidationIssueCode
  message: string

  /**
   * Доп. данные для UI/логирования (не использовать для логики, если можно опереться на `code`).
   */
  meta?: Record<string, unknown>

  /**
   * Опциональная поддержка i18n: ключ + параметры.
   * `message` остаётся обязательным как безопасный fallback.
   */
  i18nKey?: string
  i18nParams?: Record<string, unknown>
}

/**
 * Откуда пришёл набор: выбор в диалоге, перетаскивание или проверка формы перед
 * отправкой (правило `file` у `GrForm`). Последний случай отличают не ради
 * симметрии: дорогой валидатор вправе работать на submit и молчать на каждом
 * выборе файла.
 */
export type FileValidatorSource = 'input' | 'drop' | 'form'

export type FileValidatorContext = {
  source: FileValidatorSource
  multiple: boolean
  accept?: string
}

export type FileValidatorInput = {
  files: File[]
  context: FileValidatorContext
}

export type FileValidator = (input: FileValidatorInput) => FileValidationIssue[] | Promise<FileValidationIssue[]>
