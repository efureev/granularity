import type { FileValidationIssue, FileValidator } from './types'

export function maxSizeMbValidator(maxSizeMb: number | undefined): FileValidator {
  if (typeof maxSizeMb !== 'number' || !Number.isFinite(maxSizeMb) || maxSizeMb <= 0) return () => []
  const maxBytes = maxSizeMb * 1024 * 1024

  return ({ files }): FileValidationIssue[] => {
    const issues: FileValidationIssue[] = []

    for (const file of files) {
      if (file.size <= maxBytes) continue

      issues.push({
        fileName: file.name,
        code: 'maxSize',
        message: `File "${file.name}" is too large (${file.size} bytes), maxBytes=${maxBytes}`,
        meta: { maxBytes, maxSizeMb },
      })
    }

    return issues
  }
}