import { formatFileSize } from './formatFileSize'
import type { FileValidationIssue, FileValidator } from './types'

export function maxTotalSizeBytesValidator(maxBytes: number | undefined): FileValidator {
  if (typeof maxBytes !== 'number' || !Number.isFinite(maxBytes) || maxBytes <= 0)
    return () => []

  return ({ files }): FileValidationIssue[] => {
    const total = files.reduce((acc, f) => acc + (Number(f.size) || 0), 0)
    if (total <= maxBytes)
      return []

    const issue: FileValidationIssue = {
      code: 'maxTotalSize',
      message: `The files together exceed ${formatFileSize(maxBytes)}`,
      i18nParams: { total, maxBytes },
      meta: { total, maxBytes },
    }

    return [issue]
  }
}
