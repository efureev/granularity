import { describe, expect, it } from 'vitest'

import {
  FileValidationError,
  acceptValidator,
  allowedExtensionsValidator,
  allowedMimeTypesValidator,
  maxFileSizeBytesValidator,
  maxSizeMbValidator,
  maxTotalSizeBytesValidator,
  matchAccept,
  normalizeFiles,
  runFileValidators,
} from '..'

describe('fileValidation', () => {
  it('доступна как независимый reusable API без компонента', async () => {
    const pngFile = new File(['png'], 'image.png', { type: 'image/png' })
    const txtFile = new File(['hello'], 'note.txt', { type: 'text/plain' })
    const bigFile = new File([new ArrayBuffer(2 * 1024 * 1024)], 'big.bin', { type: 'application/octet-stream' })

    expect(normalizeFiles([pngFile, txtFile], false)).toEqual([pngFile])
    expect(matchAccept(pngFile, 'image/*,.txt')).toBe(true)
    expect(matchAccept(txtFile, 'image/*,.png')).toBe(false)

    const { files, issues } = await runFileValidators(
      [pngFile, txtFile, bigFile],
      [
        acceptValidator('image/*,.txt,.bin'),
        allowedExtensionsValidator(['png', '.txt', '.bin']),
        allowedMimeTypesValidator(['image/png', 'text/plain'], { allowFallbackByExtension: true }),
        maxFileSizeBytesValidator(3 * 1024 * 1024),
        maxSizeMbValidator(3),
        maxTotalSizeBytesValidator(2 * 1024 * 1024),
      ],
      {
        source: 'drop',
        multiple: true,
        accept: 'image/*,.txt,.bin',
      },
    )

    expect(files).toEqual([pngFile, txtFile, bigFile])
    expect(issues).toHaveLength(1)
    expect(issues[0]).toMatchObject({ code: 'maxTotalSize' })

    const error = new FileValidationError(issues, files)
    expect(error).toBeInstanceOf(FileValidationError)
    expect(error.code).toBe('maxTotalSize')
  })
})