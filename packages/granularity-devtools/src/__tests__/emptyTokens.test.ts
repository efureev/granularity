// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'

import { emptyTokens } from '../resolve/emptyTokens'

function markup(html: string): Element {
  const host = document.createElement('div')
  host.innerHTML = html
  return host.firstElementChild!
}

function values(table: Record<string, Record<string, string>>) {
  return { read: (element: Element, token: string) => table[element.className.split(' ')[0]!]?.[token] ?? '' }
}

describe('токены, разрешающиеся в пустоту', () => {
  it('находит потребляемый токен без значения', () => {
    const root = markup('<div class="panel"></div>')
    const consumed = new Map([['panel', new Set(['--gr-radius-control'])]])

    const report = emptyTokens(root, consumed, values({}))

    expect(report.empty).toEqual([{ token: '--gr-radius-control', className: 'panel' }])
    expect(report.checked).toBe(1)
  })

  it('молчит, когда токен разрешается', () => {
    const root = markup('<div class="panel"></div>')
    const consumed = new Map([['panel', new Set(['--gr-radius-control'])]])

    const report = emptyTokens(root, consumed, values({ panel: { '--gr-radius-control': '6px' } }))

    expect(report.empty).toEqual([])
    expect(report.checked).toBe(1)
  })

  it('пробел за значение не считает: `getPropertyValue` возвращает его с ведущим пробелом', () => {
    const root = markup('<div class="panel"></div>')
    const consumed = new Map([['panel', new Set(['--gr-bg'])]])

    const report = emptyTokens(root, consumed, values({ panel: { '--gr-bg': '   ' } }))

    expect(report.empty).toHaveLength(1)
  })

  it('заходит к потомкам: промах живёт не на корне, а на внутреннем элементе', () => {
    const root = markup('<div class="root"><span class="badge"></span></div>')
    const consumed = new Map([['badge', new Set(['--gr-badge-semi-radius-md'])]])

    const report = emptyTokens(root, consumed, values({}))

    expect(report.empty.map(finding => finding.className)).toEqual(['badge'])
  })

  it('читает токен на том элементе, чьё правило его требует, а не на корне', () => {
    const root = markup('<div class="root"><span class="inner"></span></div>')
    const consumed = new Map([['inner', new Set(['--gr-fg'])]])

    const report = emptyTokens(root, consumed, values({ inner: { '--gr-fg': '#111' } }))

    expect(report.empty).toEqual([])
  })

  it('не повторяет токен, потребляемый несколькими классами', () => {
    const root = markup('<div class="a"><span class="b"></span></div>')
    const consumed = new Map([
      ['a', new Set(['--gr-brd'])],
      ['b', new Set(['--gr-brd'])],
    ])

    const report = emptyTokens(root, consumed, values({}))

    expect(report.empty).toHaveLength(1)
    expect(report.checked).toBe(2)
  })

  it('чужие переменные не считает: `--un-*` ведёт сам UnoCSS', () => {
    const root = markup('<div class="shadow-sm"></div>')
    const consumed = new Map([['shadow-sm', new Set(['--un-shadow-inset'])]])

    expect(emptyTokens(root, consumed, values({}))).toEqual({ empty: [], checked: 0 })
  })

  it('классы без потребления не считаются проверенными', () => {
    const root = markup('<div class="plain"></div>')

    const report = emptyTokens(root, new Map(), values({}))

    expect(report).toEqual({ empty: [], checked: 0 })
  })
})
