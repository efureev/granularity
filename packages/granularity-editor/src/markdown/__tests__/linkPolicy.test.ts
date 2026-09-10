import { describe, expect, it } from 'vitest'

import { GR_MARKDOWN_DEFAULT_PROTOCOLS, isExternalUrl, safeUrl } from '../linkPolicy'

/** Управляющие символы строим кодом: в исходнике теста они были бы невидимы. */
const TAB = String.fromCharCode(9)
const LF = String.fromCharCode(10)

describe('политика ссылок', () => {
  it('пропускает то, ради чего существует', () => {
    expect(safeUrl('https://example.com/a?b=1#c')).toBe('https://example.com/a?b=1#c')
    expect(safeUrl('http://example.com')).toBe('http://example.com')
    expect(safeUrl('mailto:a@b.co')).toBe('mailto:a@b.co')
    expect(safeUrl('tel:+79990000000')).toBe('tel:+79990000000')
    expect(safeUrl('/docs/page')).toBe('/docs/page')
    expect(safeUrl('../sibling.md')).toBe('../sibling.md')
    expect(safeUrl('#anchor')).toBe('#anchor')
  })

  it('отбрасывает исполняемые схемы', () => {
    expect(safeUrl('javascript:alert(1)')).toBeNull()
    expect(safeUrl('JavaScript:alert(1)')).toBeNull()
    expect(safeUrl('vbscript:msgbox')).toBeNull()
    expect(safeUrl('data:text/html;base64,PHN2Zz4=')).toBeNull()
    expect(safeUrl('file:///etc/passwd')).toBeNull()
  })

  it('видит схему сквозь сущности — на этом ломается наивная проверка', () => {
    expect(safeUrl('&#x6a;avascript:alert(1)')).toBeNull()
    expect(safeUrl('&#106;avascript:alert(1)')).toBeNull()
    expect(safeUrl('java&Tab;script:alert(1)')).toBeNull()
    expect(safeUrl('java&NewLine;script:alert(1)')).toBeNull()
    expect(safeUrl('&#106;&#97;&#118;&#97;script:alert(1)')).toBeNull()
  })

  it('видит схему сквозь пробелы и управляющие символы', () => {
    expect(safeUrl('  javascript:alert(1)')).toBeNull()
    expect(safeUrl(`java${TAB}script:alert(1)`)).toBeNull()
    expect(safeUrl(`java${LF}script:alert(1)`)).toBeNull()
    expect(safeUrl('jav ascript:alert(1)')).toBeNull()
  })

  it('разворачивает сущности один раз, а не до неподвижной точки', () => {
    // `&amp;#x6a;` — это текст `&#x6a;`, а не буква `j`: второй проход создал бы
    // схему, которой в исходнике не было.
    expect(safeUrl('&amp;#x6a;avascript:alert(1)')).toBe('&amp;#x6a;avascript:alert(1)')
  })

  it('пустое и мусорное значение ссылкой не становится', () => {
    expect(safeUrl('')).toBeNull()
    expect(safeUrl(null)).toBeNull()
    expect(safeUrl(undefined)).toBeNull()
    expect(safeUrl('   ')).toBeNull()
  })

  it('список протоколов задаётся потребителем', () => {
    expect(safeUrl('ftp://host/file', [...GR_MARKDOWN_DEFAULT_PROTOCOLS])).toBeNull()
    expect(safeUrl('ftp://host/file', ['ftp'])).toBe('ftp://host/file')
  })

  it('внешнюю ссылку отличает от внутренней', () => {
    expect(isExternalUrl('https://example.com')).toBe(true)
    expect(isExternalUrl('//example.com')).toBe(true)
    expect(isExternalUrl('/docs')).toBe(false)
    expect(isExternalUrl('#a')).toBe(false)
    expect(isExternalUrl('mailto:a@b.co')).toBe(false)
  })
})
