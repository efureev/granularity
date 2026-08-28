// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'

import { resetStylesheetIndex, stylesheetIndex } from '../internal/stylesheetIndex'

function addStyle(css: string): HTMLStyleElement {
  const style = document.createElement('style')
  style.textContent = css
  document.head.append(style)
  return style
}

afterEach(() => {
  document.head.querySelectorAll('style').forEach(style => style.remove())
  resetStylesheetIndex()
})

describe('индекс селекторов документа', () => {
  it('собирает классы из правил', () => {
    addStyle('.btn { color: red } .card .title { font-weight: 700 }')

    const index = stylesheetIndex()

    expect(index.styled.has('btn')).toBe(true)
    expect(index.styled.has('title')).toBe(true)
    expect(index.styled.has('missing')).toBe(false)
  })

  it('заходит внутрь @media: иначе адаптивные утилиты числились бы без правил', () => {
    addStyle('@media (min-width: 768px) { .md-only { display: block } }')

    expect(stylesheetIndex().styled.has('md-only')).toBe(true)
  })

  it('заходит внутрь @supports и @layer', () => {
    addStyle('@supports (display: grid) { .grid-ok { display: grid } }')
    addStyle('@layer utilities { .layered { margin: 0 } }')

    const styled = stylesheetIndex().styled
    expect(styled.has('grid-ok')).toBe(true)
    expect(styled.has('layered')).toBe(true)
  })

  it('кэширует: второй вызов отдаёт тот же объект', () => {
    addStyle('.a { color: red }')

    expect(stylesheetIndex()).toBe(stylesheetIndex())
  })
})

describe('потребление токенов без запасного значения', () => {
  it('записывает токен, читаемый правилом класса', () => {
    addStyle('.panel { border-radius: var(--gr-radius-control) }')

    expect(stylesheetIndex().consumed.get('panel')).toEqual(new Map([['--gr-radius-control', { strict: true }]]))
  })

  it('потребление с запасом записывает, но помечает нестрогим', () => {
    addStyle('.rail { background: var(--gr-slider-rail, #e2e8f0) }')

    expect(stylesheetIndex().consumed.get('rail')).toEqual(new Map([['--gr-slider-rail', { strict: false }]]))
  })

  it('строгим считает токен, прочитанный без запаса хотя бы раз', () => {
    addStyle('.dual { color: var(--gr-fg, #111) }')
    addStyle('.dual { border-color: var(--gr-fg) }')

    expect(stylesheetIndex().consumed.get('dual')).toEqual(new Map([['--gr-fg', { strict: true }]]))
  })

  it('оставляет ПОСЛЕДНИЙ `var()` цепочки запасных: пуст он — объявление всё равно отбраковано', () => {
    addStyle('.fill { background: var(--gr-slider-fill, var(--gr-primary)) }')

    expect(stylesheetIndex().consumed.get('fill')).toEqual(new Map([
      ['--gr-slider-fill', { strict: false }],
      ['--gr-primary', { strict: true }],
    ]))
  })

  it('собирает по всем объявлениям правила', () => {
    addStyle('.card { background: var(--gr-bg); border-color: var(--gr-brd) }')

    expect(stylesheetIndex().consumed.get('card')).toEqual(new Map([
      ['--gr-bg', { strict: true }],
      ['--gr-brd', { strict: true }],
    ]))
  })

  it('раздаёт токены каждому классу составного селектора', () => {
    addStyle('.a .b { color: var(--gr-fg) }')

    const consumed = stylesheetIndex().consumed
    expect(consumed.get('a')).toEqual(new Map([['--gr-fg', { strict: true }]]))
    expect(consumed.get('b')).toEqual(new Map([['--gr-fg', { strict: true }]]))
  })

  it('заходит внутрь @media — иначе адаптивное правило осталось бы неучтённым', () => {
    addStyle('@media (min-width: 768px) { .wide { gap: var(--gr-space-4) } }')

    expect(stylesheetIndex().consumed.get('wide')).toEqual(new Map([['--gr-space-4', { strict: true }]]))
  })

  it('сливает токены из нескольких правил одного класса', () => {
    addStyle('.btn { color: var(--gr-fg) }')
    addStyle('.btn { background: var(--gr-bg) }')

    expect(stylesheetIndex().consumed.get('btn')).toEqual(new Map([
      ['--gr-fg', { strict: true }],
      ['--gr-bg', { strict: true }],
    ]))
  })
})
