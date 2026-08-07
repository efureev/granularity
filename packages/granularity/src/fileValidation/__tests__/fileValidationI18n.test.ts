import { describe, expect, it } from 'vitest'

import en from '../../i18n/locales/en.json'
import {
  acceptValidator,
  allowedExtensionsValidator,
  allowedMimeTypesValidator,
  fileValidationI18nKey,
  maxFileSize,
  maxTotalSizeBytesValidator,
  resolveFileValidationMessage,
} from '..'
import type { FileValidationIssue, FileValidator } from '../types'

/**
 * Локализуемость ошибок валидации.
 *
 * До этого все шесть валидаторов возвращали захардкоженный английский в
 * `message`, и другого канала не было: приложение на русском показывало
 * `File "photo.png" does not match accept="..."` и сделать с этим ничего не
 * могло. Теперь текст выводится из `code` + параметров, а `message` остаётся
 * фолбэком для тех, кто i18n не подключил.
 */

function file(name: string, size = 1, type = 'image/png'): File {
  return new File([new Uint8Array(size)], name, { type })
}

async function run(validator: FileValidator, files: File[]): Promise<FileValidationIssue[]> {
  return validator({ files, context: { source: 'input', multiple: true } })
}

/** `t` из `useGranularityTranslations`: ключ → строка, иначе fallback. */
function translator(messages: Record<string, string>) {
  return (key: string, fallback: string, params?: Record<string, unknown>): string =>
    (messages[key] ?? fallback).replace(/\{(\w+)\}/g, (m, name) => String(params?.[name] ?? m))
}

describe('ошибки валидации локализуемы', () => {
  it.each([
    ['accept', () => acceptValidator('.pdf'), [file('photo.png')], { fileName: 'photo.png', accept: '.pdf' }],
    ['extension', () => allowedExtensionsValidator(['pdf']), [file('photo.png')], { fileName: 'photo.png', extension: 'png' }],
    ['mimeType', () => allowedMimeTypesValidator(['application/pdf']), [file('photo.png')], { fileName: 'photo.png', mimeType: 'image/png' }],
    ['maxFileSize', () => maxFileSize({ bytes: 1 }), [file('big.png', 10)], { fileName: 'big.png', maxBytes: 1 }],
    ['maxTotalSize', () => maxTotalSizeBytesValidator(1), [file('a.png', 10)], { maxBytes: 1 }],
  ])('%s отдаёт параметры, а не только текст', async (code, make, files, expected) => {
    const [issue] = await run(make(), files)

    expect(issue?.code).toBe(code)
    expect(issue?.i18nParams).toMatchObject(expected)
    // `message` обязан остаться: на него опирается код, ничего не знающий про i18n.
    expect(issue?.message).toBeTruthy()
  })

  it('на каждый code есть строка в en-локали', async () => {
    const issues = [
      ...await run(acceptValidator('.pdf'), [file('a.png')]),
      ...await run(allowedExtensionsValidator(['pdf']), [file('a.png')]),
      ...await run(allowedMimeTypesValidator(['application/pdf']), [file('a.png')]),
      ...await run(allowedMimeTypesValidator(['application/pdf'], { allowFallbackByExtension: false }), [file('a.bin', 1, '')]),
      ...await run(maxFileSize({ bytes: 1 }), [file('a.png', 10)]),
      ...await run(maxTotalSizeBytesValidator(1), [file('a.png', 10)]),
    ]
    const block = en.fileValidation

    const missing = issues
      .map(issue => (issue.i18nKey ?? fileValidationI18nKey(issue.code)).replace('gr.fileValidation.', ''))
      .filter(name => !(name in block))

    expect([...new Set(missing)], `нет строки в локали: ${missing.join(', ')}`).toEqual([])
  })

  it('fallback-тип mime получает свой ключ при общем code', async () => {
    // Один `code` на две разные формулировки — ветка обработчика у потребителя
    // одна, а текст нужен разный.
    const [issue] = await run(
      allowedMimeTypesValidator(['application/pdf'], { allowFallbackByExtension: false }),
      [file('a.bin', 1, '')],
    )

    expect(issue?.code).toBe('mimeType')
    expect(issue?.i18nKey).toBe('gr.fileValidation.mimeTypeFallback')
  })
})

describe('resolveFileValidationMessage', () => {
  const issue: FileValidationIssue = {
    code: 'accept',
    message: 'English fallback',
    i18nParams: { fileName: 'photo.png', accept: '.pdf' },
  }

  it('переводит по ключу, выведенному из code', () => {
    const t = translator({ 'gr.fileValidation.accept': 'Файл «{fileName}» не подходит под {accept}' })

    expect(resolveFileValidationMessage(issue, t)).toBe('Файл «photo.png» не подходит под .pdf')
  })

  it('явный i18nKey важнее выведенного', () => {
    const t = translator({ 'custom.key': 'Своя строка' })

    expect(resolveFileValidationMessage({ ...issue, i18nKey: 'custom.key' }, t)).toBe('Своя строка')
  })

  it('без перевода показывает message валидатора', () => {
    // Валидатор потребителя ничего не знает про ключи — он обязан остаться видимым.
    const custom: FileValidationIssue = { code: 'my-rule', message: 'Своё правило нарушено' }

    expect(resolveFileValidationMessage(custom, translator({}))).toBe('Своё правило нарушено')
  })
})
