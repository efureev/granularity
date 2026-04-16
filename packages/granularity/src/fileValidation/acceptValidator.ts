import type { FileValidationIssue, FileValidator } from './types'

import { matchAccept } from './matchAccept'

export function acceptValidator(accept: string | undefined): FileValidator {
  if (!accept) return () => []

  return ({ files }): FileValidationIssue[] => {
    const issues: FileValidationIssue[] = []

    for (const file of files) {
      if (matchAccept(file, accept)) continue

      issues.push({
        fileName: file.name,
        code: 'accept',
        message: `File "${file.name}" does not match accept="${accept}"`,
      })
    }

    return issues
  }
}