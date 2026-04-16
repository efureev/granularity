import type { FileValidationIssue, FileValidator } from './types'

function normalizeExtensions(exts: string[] | undefined): string[] {
  return (exts ?? [])
    .map(s => s.trim().toLowerCase())
    .filter(Boolean)
    .map(s => (s.startsWith('.') ? s.slice(1) : s))
}

function fileExtensionLower(fileName: string): string {
  const i = fileName.lastIndexOf('.')
  if (i < 0) return ''
  return fileName.slice(i + 1).toLowerCase()
}

export function allowedExtensionsValidator(exts: string[]): FileValidator {
  const allowedExt = normalizeExtensions(exts)
  if (allowedExt.length === 0) return () => []

  return ({ files }): FileValidationIssue[] => {
    const issues: FileValidationIssue[] = []

    for (const file of files) {
      const ext = fileExtensionLower(file.name)
      if (!ext) continue

      if (!allowedExt.includes(ext)) {
        issues.push({
          fileName: file.name,
          code: 'extension',
          message: `File "${file.name}" has disallowed extension ".${ext}"`,
        })
      }
    }

    return issues
  }
}