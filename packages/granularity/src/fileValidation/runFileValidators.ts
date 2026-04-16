import type { FileValidationIssue, FileValidator, FileValidatorContext } from './types'

export function normalizeFiles(files: File[], multiple: boolean): File[] {
  const list = [...files]
  return multiple ? list : list.slice(0, 1)
}

function isPromiseLike<T>(value: unknown): value is PromiseLike<T> {
  return !!value && typeof (value as any).then === 'function'
}

export type RunFileValidatorsResult = { files: File[]; issues: FileValidationIssue[] }

export function runFileValidators(
  files: File[],
  validators: FileValidator[] | undefined,
  context: FileValidatorContext,
): RunFileValidatorsResult | Promise<RunFileValidatorsResult> {
  const picked = normalizeFiles(files, context.multiple)

  const issues: FileValidationIssue[] = []

  const list = validators ?? []
  for (let i = 0; i < list.length; i++) {
    const validator = list[i]
    if (!validator) continue

    const res = validator({ files: picked, context })

    if (isPromiseLike<FileValidationIssue[]>(res)) {
      return (async () => {
        const first = await res
        if (Array.isArray(first) && first.length > 0) issues.push(...first)

        for (let j = i + 1; j < list.length; j++) {
          const nextValidator = list[j]
          if (!nextValidator) continue

          const nextRes = nextValidator({ files: picked, context })
          const next = isPromiseLike<FileValidationIssue[]>(nextRes) ? await nextRes : nextRes
          if (Array.isArray(next) && next.length > 0) issues.push(...next)
        }

        return { files: picked, issues }
      })()
    }

    if (Array.isArray(res) && res.length > 0) issues.push(...res)
  }

  return { files: picked, issues }
}