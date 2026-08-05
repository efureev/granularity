import type { FileValidationIssue, FileValidator } from './types'

/**
 * Ограничение количества файлов в наборе.
 *
 * Валидатором, а не проверкой внутри компонента: тогда ограничение одинаково
 * работает и на выборе через диалог, и на перетаскивании, и его сообщение
 * проходит тем же путём локализации, что и остальные.
 */
export function maxCountValidator(maxCount: number | undefined): FileValidator {
  if (typeof maxCount !== 'number' || !Number.isFinite(maxCount) || maxCount <= 0) return () => []

  const limit = Math.floor(maxCount)

  return ({ files }): FileValidationIssue[] => {
    if (files.length <= limit) return []

    const issue: FileValidationIssue = {
      code: 'maxCount',
      message: `Too many files selected (${files.length}), maxCount=${limit}`,
      i18nParams: { count: files.length, maxCount: limit },
      meta: { count: files.length, maxCount: limit },
    }

    return [issue]
  }
}
