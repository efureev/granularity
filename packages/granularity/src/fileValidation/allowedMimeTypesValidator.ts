import type { FileValidationIssue, FileValidator } from './types'

export type AllowedMimeTypesValidatorOptions = {
  /**
   * Если `true`, то для fallback-типа (`''`/`application/octet-stream`) валидация по MIME пропускается,
   * предполагая проверку расширения отдельным валидатором.
   */
  allowFallbackByExtension?: boolean
}

function isFallbackType(type: string): boolean {
  return type === '' || type === 'application/octet-stream'
}

export function allowedMimeTypesValidator(
  allowed: string[],
  options: AllowedMimeTypesValidatorOptions = {},
): FileValidator {
  const allowedMime = (allowed ?? []).map(s => s.trim().toLowerCase()).filter(Boolean)
  if (allowedMime.length === 0) return () => []

  return ({ files }): FileValidationIssue[] => {
    const issues: FileValidationIssue[] = []

    for (const file of files) {
      const fileType = (file.type || '').toLowerCase()

      if (isFallbackType(fileType)) {
        // Legacy behavior in DS: fallback types are not rejected by MIME allow-list.
        // If consumer needs strictness, it can explicitly forbid fallback types.
        if (options.allowFallbackByExtension === false) {
          issues.push({
            fileName: file.name,
            code: 'mimeType',
            message: `File "${file.name}" has fallback mime type "${fileType}"`,
          })
        }

        continue
      }

      if (!allowedMime.includes(fileType)) {
        issues.push({
          fileName: file.name,
          code: 'mimeType',
          message: `File "${file.name}" has disallowed mime type "${fileType}"`,
        })
      }
    }

    return issues
  }
}