import { describe, expect, it } from 'vitest'

import { fileKindOf, isPreviewableKind } from '../fileKindOf'

describe('fileKindOf', () => {
  it.each([
    'image/png',
    'image/jpeg',
    'image/webp',
    'image/svg+xml',
    'image/heic',
  ])('%s — картинка', (mime) => {
    expect(fileKindOf(mime)).toBe('image')
  })

  it.each([
    ['application/pdf', 'pdf'],
    ['application/x-pdf', 'pdf'],
    ['application/msword', 'document'],
    ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'document'],
    ['application/vnd.oasis.opendocument.text', 'document'],
    ['application/rtf', 'document'],
    ['application/vnd.ms-excel', 'spreadsheet'],
    ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'spreadsheet'],
    ['application/zip', 'archive'],
    ['application/vnd.rar', 'archive'],
    ['application/x-7z-compressed', 'archive'],
    ['application/gzip', 'archive'],
  ] as const)('%s — %s', (mime, kind) => {
    expect(fileKindOf(mime)).toBe(kind)
  })

  it('произвольный текст — документ', () => {
    expect(fileKindOf('text/plain')).toBe('document')
    expect(fileKindOf('text/markdown')).toBe('document')
  })

  // Таблица важнее общего правила для текста: иначе CSV получил бы иконку
  // документа, хотя открывается он таблицей.
  it('text/csv — таблица, а не документ', () => {
    expect(fileKindOf('text/csv')).toBe('spreadsheet')
    expect(fileKindOf('text/tab-separated-values')).toBe('spreadsheet')
  })

  // Тип приходит из БД: он бывает с параметрами и в любом регистре.
  it('регистр и параметры не мешают разбору', () => {
    expect(fileKindOf('IMAGE/PNG')).toBe('image')
    expect(fileKindOf('text/plain; charset=utf-8')).toBe('document')
    expect(fileKindOf('  application/pdf  ')).toBe('pdf')
    expect(fileKindOf('Application/Vnd.RAR')).toBe('archive')
  })

  // Пустой тип — обычное дело: бэкенд его не проставил. Это не повод рисовать
  // битую картинку.
  it.each([
    ['null', null],
    ['undefined', undefined],
    ['пустая строка', ''],
    ['только пробелы', '   '],
    ['только параметры', '; charset=utf-8'],
  ])('%s даёт unknown', (_name, mime) => {
    expect(fileKindOf(mime)).toBe('unknown')
  })

  it('fallback-тип и незнакомый тип — unknown', () => {
    expect(fileKindOf('application/octet-stream')).toBe('unknown')
    expect(fileKindOf('application/vnd.custom-thing')).toBe('unknown')
    expect(fileKindOf('video/mp4')).toBe('unknown')
  })

  // `image` — единственный вид, который рисуется `<img>`. Ровно на этом ломался
  // обход у потребителя: PDF уходил в `<img>` и давал битую иконку.
  it('показывается только картинка', () => {
    expect(isPreviewableKind('image')).toBe(true)

    for (const kind of ['pdf', 'document', 'spreadsheet', 'archive', 'unknown'] as const) {
      expect(isPreviewableKind(kind), kind).toBe(false)
    }
  })
})
