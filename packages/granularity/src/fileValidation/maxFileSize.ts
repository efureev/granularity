import type { FileValidationIssue, FileValidator } from './types'

export interface MaxFileSizeOptions {
  /** Предел в байтах. */
  bytes?: number
  /** Предел в мегабайтах — sugar к `bytes` (1 МБ = 1024 × 1024). */
  mb?: number
}

function normalizeLimit(value: number | undefined): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : undefined
}

/**
 * Ограничение размера **одного** файла. Суммарный размер набора — отдельный
 * валидатор `maxTotalSizeBytesValidator`.
 *
 * Предел задаётся либо в байтах, либо в мегабайтах. Если заданы оба, берётся
 * меньший: молча игнорировать один из двух объявленных пределов хуже, чем
 * применить строгий.
 */
export function maxFileSize(options: MaxFileSizeOptions): FileValidator {
  const fromBytes = normalizeLimit(options.bytes)
  const fromMb = normalizeLimit(options.mb)
  const limits = [fromBytes, fromMb === undefined ? undefined : fromMb * 1024 * 1024]
    .filter((value): value is number => value !== undefined)

  if (!limits.length) return () => []

  const maxBytes = Math.min(...limits)

  return ({ files }): FileValidationIssue[] => {
    const issues: FileValidationIssue[] = []

    for (const file of files) {
      if (file.size <= maxBytes) continue

      issues.push({
        fileName: file.name,
        code: 'maxFileSize',
        message: `File "${file.name}" is too large (${file.size} bytes), maxBytes=${maxBytes}`,
        i18nParams: { fileName: file.name, size: file.size, maxBytes },
        meta: { maxBytes },
      })
    }

    return issues
  }
}
