import type { FileValidationIssue, FileValidator } from './types'

export function maxTotalSizeBytesValidator(maxBytes: number | undefined): FileValidator {
  if (typeof maxBytes !== 'number' || !Number.isFinite(maxBytes) || maxBytes <= 0) return () => []

  return ({ files }): FileValidationIssue[] => {
    const total = files.reduce((acc, f) => acc + (Number(f.size) || 0), 0)
    if (total <= maxBytes) return []

    const issue: FileValidationIssue = {
      code: 'maxTotalSize',
      message: `Total files size is too large (${total} bytes), maxTotalSizeBytes=${maxBytes}`,
      meta: { total, maxBytes },
    }

    return [issue]
  }
}