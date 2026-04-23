import type { FileValidationIssue, FileValidationIssueCode } from './types'

export class FileValidationError extends Error {
  code: FileValidationIssueCode
  file?: File
  issues: FileValidationIssue[]

  constructor(issues: FileValidationIssue[], files?: File[], message?: string) {
    super(message ?? issues[0]?.message ?? 'File validation failed')
    this.name = 'FileValidationError'

    this.issues = issues
    this.code = issues[0]?.code ?? 'accept'

    const firstFileName = issues[0]?.fileName
    const byName = firstFileName && files ? files.find(f => f.name === firstFileName) : undefined
    // Fallback to the first file if the named one isn't present in `files`
    // (e.g. aggregate issue like `maxTotalSize` has no `fileName`, or names diverged).
    this.file = byName ?? files?.[0]
  }
}