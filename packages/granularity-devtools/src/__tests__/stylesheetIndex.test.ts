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
