import { describe, expect, it } from 'vitest'

import en from '../../i18n/locales/en.json'
import es from '../../i18n/locales/es.json'
import ru from '../../i18n/locales/ru.json'
import {
  acceptValidator,
  allowedExtensionsValidator,
  allowedMimeTypesValidator,
  fileValidationI18nKey,
  formatFileSize,
  maxCountValidator,
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

/** Плоский словарь `gr.*` из JSON локали — как его видит `t`. */
function flatten(block: Record<string, unknown>, prefix = 'gr'): Record<string, string> {
  return Object.fromEntries(Object.entries(block).flatMap(([key, value]) =>
    typeof value === 'string'
      ? [[`${prefix}.${key}`, value]]
      : Object.entries(flatten(value as Record<string, unknown>, `${prefix}.${key}`))))
}

/**
 * Текст ошибки видит пользователь: на сайте поле формы показывало
 * «File "statement-oct.pdf" does not match accept=".csv,.ofx"». Ни
 * `accept="…"`, ни `maxBytes=…`, ни размера в байтах в сообщении быть не должно
 * — ни в одной локали, ни в английском `message` валидатора.
 */
describe('сообщения написаны для человека', () => {
  const MB = 1024 * 1024

  async function allIssues(): Promise<FileValidationIssue[]> {
    return [
      ...await run(acceptValidator('.csv,.ofx'), [file('statement-oct.pdf')]),
      ...await run(allowedExtensionsValidator(['csv']), [file('statement-oct.pdf')]),
      ...await run(allowedMimeTypesValidator(['text/csv']), [file('photo.png')]),
      ...await run(allowedMimeTypesValidator(['text/csv'], { allowFallbackByExtension: false }), [file('a.bin', 1, '')]),
      ...await run(maxFileSize({ mb: 10 }), [file('report.pdf', 10 * MB + 1)]),
      ...await run(maxCountValidator(6), Array.from({ length: 7 }, (_, index) => file(`${index}.png`))),
      ...await run(maxTotalSizeBytesValidator(50 * MB), [file('a.pdf', 30 * MB), file('b.pdf', 30 * MB)]),
    ]
  }

  function expectHuman(text: string): void {
    expect(text).not.toMatch(/=/)
    expect(text, 'размер в байтах').not.toMatch(/\d{4,}/)
    expect(text).not.toMatch(/\bbytes?\b|байт/)
    expect(text).not.toMatch(/\{\w+\}/)
  }

  it.each([['en', en], ['ru', ru], ['es', es]] as const)('%s', async (_locale, messages) => {
    const t = translator(flatten(messages))

    for (const issue of await allIssues())
      expectHuman(resolveFileValidationMessage(issue, t, _locale))
  })

  it('английский `message` валидатора — тоже', async () => {
    for (const issue of await allIssues())
      expectHuman(issue.message)
  })

  it('пределы называются в KB и MB, а не в байтах', async () => {
    const t = translator(flatten(en))
    const [big] = await run(maxFileSize({ mb: 10 }), [file('report.pdf', 10 * MB + 1)])
    const [total] = await run(maxTotalSizeBytesValidator(50 * MB), [file('a.pdf', 30 * MB), file('b.pdf', 30 * MB)])
    const [many] = await run(maxCountValidator(6), Array.from({ length: 7 }, (_, index) => file(`${index}.png`)))

    expect(resolveFileValidationMessage(big, t)).toBe('report.pdf is larger than 10 MB')
    expect(resolveFileValidationMessage(total, t)).toBe('The files together exceed 50 MB')
    expect(resolveFileValidationMessage(many, t)).toBe('Too many files: up to 6 allowed')
  })

  it('размер округляется и пишется числом своей локали', () => {
    const t = translator(flatten(ru))

    expect(formatFileSize(512)).toBe('512 B')
    expect(formatFileSize(500 * 1024)).toBe('500 KB')
    expect(formatFileSize(1.5 * MB)).toBe('1.5 MB')
    expect(formatFileSize(12.4 * MB)).toBe('12 MB')
    expect(formatFileSize(1.5 * MB, { t, locale: 'ru' })).toBe('1,5 МБ')
  })
})
