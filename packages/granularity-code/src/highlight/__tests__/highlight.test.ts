import { describe, expect, it, vi } from 'vitest'

import { GR_CODE_ROLES, isGrCodeRole, plainLines } from '../palette'
import { GR_CODE_SHIKI_THEME, markerFor, roleForMarker } from '../shikiTheme'
import { createShikiTokenizer, type ShikiLike } from '../fromShiki'
import { classForRole, LEZER_TAGS_BY_ROLE, roleForClass } from '../fromLezer'

/**
 * Палитра — единственное, что связывает три производителя подсветки. Разойдись
 * они, один и тот же код выглядел бы по-разному в блоке, диффе и редакторе, а
 * заметить это можно только глазами и только на нужном языке.
 */
describe('палитра', () => {
  it('одиннадцать ролей, и `plain` среди них', () => {
    expect(GR_CODE_ROLES).toHaveLength(11)
    expect(GR_CODE_ROLES).toContain('plain')
  })

  it('чужое имя роли не признаётся', () => {
    expect(isGrCodeRole('keyword')).toBe(true)
    expect(isGrCodeRole('macro')).toBe(false)
    expect(isGrCodeRole(undefined)).toBe(false)
  })
})

describe('plainLines', () => {
  it('строк столько же, сколько переносов плюс один', () => {
    expect(plainLines('a\nb\nc')).toHaveLength(3)
  })

  /** Пустая строка обязана остаться строкой, иначе номера строк уедут. */
  it('пустая строка не исчезает', () => {
    const lines = plainLines('a\n\nb')

    expect(lines).toHaveLength(3)
    expect(lines[1]).toEqual([{ text: '', role: 'plain' }])
  })

  it('склейка текста равна исходной строке', () => {
    const source = 'const x = 1\n\n// хвост'

    expect(plainLines(source).map(line => line.map(t => t.text).join('')).join('\n')).toBe(source)
  })
})

describe('тема-метка Shiki', () => {
  it('у каждой роли свой цвет-метка', () => {
    const markers = GR_CODE_ROLES.map(markerFor)

    expect(new Set(markers).size).toBe(GR_CODE_ROLES.length)
  })

  it('метка разбирается обратно в ту же роль', () => {
    for (const role of GR_CODE_ROLES)
      expect(roleForMarker(markerFor(role))).toBe(role)
  })

  /** Shiki красит не всё: токен без цвета обязан остаться текстом, а не пропасть. */
  it('цвет, которого нет, падает в `plain`', () => {
    expect(roleForMarker(undefined)).toBe('plain')
    expect(roleForMarker('#ff00ff')).toBe('plain')
  })

  it('регистр цвета не важен — Shiki волен вернуть верхний', () => {
    expect(roleForMarker(markerFor('keyword').toUpperCase())).toBe('keyword')
  })

  it('в теме объявлены все роли, кроме `plain` — он дефолт', () => {
    const scoped = GR_CODE_SHIKI_THEME.settings.filter(entry => 'scope' in entry)

    expect(scoped).toHaveLength(GR_CODE_ROLES.length - 1)
  })
})

describe('createShikiTokenizer', () => {
  const highlighter = (lines: Array<Array<{ content: string, color?: string }>>): ShikiLike => ({
    codeToTokensBase: () => lines,
  })

  it('цвет-метка превращается в роль', () => {
    const tokenize = createShikiTokenizer(highlighter([
      [{ content: 'const', color: markerFor('keyword') }, { content: ' x', color: markerFor('variable') }],
    ]))

    expect(tokenize('const x', 'ts')).toEqual([
      [{ text: 'const', role: 'keyword' }, { text: ' x', role: 'variable' }],
    ])
  })

  /**
   * Незагруженная грамматика — штатная ситуация: экземпляр собирает потребитель.
   * Блок обязан показать текст, а не пустоту.
   */
  it('незнакомый язык не роняет компонент, а даёт обычный текст', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const tokenize = createShikiTokenizer({
      codeToTokensBase: () => {
        throw new Error('language not loaded')
      },
    })

    expect(tokenize('a\nb', 'brainfuck')).toEqual(plainLines('a\nb'))
    expect(warn).toHaveBeenCalledTimes(1)

    // Предупреждение дедуплицируется по языку: страница с сотней блоков на
    // одном незагруженном языке не должна залить консоль.
    void tokenize('c', 'brainfuck')
    expect(warn).toHaveBeenCalledTimes(1)

    warn.mockRestore()
  })
})

describe('мост к CodeMirror', () => {
  it('класс роли и разбор обратно сходятся', () => {
    for (const role of GR_CODE_ROLES)
      expect(roleForClass(classForRole(role))).toBe(role)
  })

  it('чужой класс — `plain`, а не исключение', () => {
    expect(roleForClass('cm-keyword')).toBe('plain')
    expect(roleForClass('')).toBe('plain')
  })

  it('теги Lezer объявлены для всех ролей, кроме `plain`', () => {
    const covered = Object.keys(LEZER_TAGS_BY_ROLE)

    expect(covered.sort()).toEqual(GR_CODE_ROLES.filter(role => role !== 'plain').slice().sort())
  })

  /** Один тег в двух ролях — расхождение цвета на ровном месте. */
  it('один тег не приписан двум ролям', () => {
    const all = Object.values(LEZER_TAGS_BY_ROLE).flat()

    expect(new Set(all).size).toBe(all.length)
  })
})
