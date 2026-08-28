// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'

import { groupUsedTokens, usedTokens } from '../resolve/usedTokens'

function markup(html: string): Element {
  const host = document.createElement('div')
  host.innerHTML = html
  return host.firstElementChild!
}

function index(map: Record<string, string[]>, withFallback: string[] = []) {
  return new Map(Object.entries(map).map(([className, tokens]) => [
    className,
    new Map(tokens.map(token => [token, { strict: !withFallback.includes(token) }])),
  ]))
}

const values = (table: Record<string, string>) => ({ read: (_: Element, token: string) => table[token] ?? '' })

describe('токены, которые компонент потребляет', () => {
  it('свой токен отличает от чужого компонентного', () => {
    const root = markup('<div class="alert"></div>')
    const used = usedTokens(root, 'GrAlert', index({ alert: ['--gr-alert-bg', '--gr-button-radius'] }), values({}))

    expect(used.find(token => token.name === '--gr-alert-bg')?.origin).toBe('own')

    const foreign = used.find(token => token.name === '--gr-button-radius')
    expect(foreign?.origin).toBe('component')
    expect(foreign?.owner).toBe('GrButton')
  })

  it('базовый токен помечает foundation, а не «ничей»', () => {
    const root = markup('<div class="alert"></div>')
    const used = usedTokens(root, 'GrAlert', index({ alert: ['--gr-radius-control'] }), values({}))

    expect(used[0]!.origin).toBe('foundation')
    expect(used[0]!.owner).toBeUndefined()
  })

  it('токен вне реестров помечает unregistered: почти всегда опечатка', () => {
    const root = markup('<div class="alert"></div>')
    const used = usedTokens(root, 'GrAlert', index({ alert: ['--gr-radius-controll'] }), values({}))

    expect(used[0]!.origin).toBe('unknown')
  })

  it('значение берёт из вычисленного стиля', () => {
    const root = markup('<div class="alert"></div>')
    const used = usedTokens(root, 'GrAlert', index({ alert: ['--gr-alert-bg'] }), values({ '--gr-alert-bg': '#111827' }))

    expect(used[0]!.value).toBe('#111827')
  })

  it('различает чтение с запасом и без', () => {
    const root = markup('<div class="alert"></div>')
    const used = usedTokens(
      root,
      'GrAlert',
      index({ alert: ['--gr-alert-bg', '--gr-fg'] }, ['--gr-fg']),
      values({}),
    )

    expect(used.find(token => token.name === '--gr-alert-bg')?.strict).toBe(true)
    expect(used.find(token => token.name === '--gr-fg')?.strict).toBe(false)
  })

  it('токен, прочитанный без запаса хоть одним классом, строгий', () => {
    const root = markup('<div class="a"><span class="b"></span></div>')
    const consumed = new Map([
      ['a', new Map([['--gr-fg', { strict: false }]])],
      ['b', new Map([['--gr-fg', { strict: true }]])],
    ])

    expect(usedTokens(root, 'GrAlert', consumed, values({}))).toHaveLength(1)
    expect(usedTokens(root, 'GrAlert', consumed, values({}))[0]!.strict).toBe(true)
  })

  it('чужие переменные не считает', () => {
    const root = markup('<div class="shadow-sm"></div>')

    expect(usedTokens(root, 'GrAlert', index({ 'shadow-sm': ['--un-shadow-inset'] }), values({}))).toEqual([])
  })

  it('раскладка идёт своим, чужим компонентным, базовым, нереестровым', () => {
    const root = markup('<div class="alert"></div>')
    const used = usedTokens(
      root,
      'GrAlert',
      index({ alert: ['--gr-alert-bg', '--gr-button-radius', '--gr-radius-control', '--gr-nope'] }),
      values({}),
    )

    const grouped = groupUsedTokens(used)
    expect(grouped.own.map(token => token.name)).toEqual(['--gr-alert-bg'])
    expect(grouped.component.map(token => token.name)).toEqual(['--gr-button-radius'])
    expect(grouped.foundation.map(token => token.name)).toEqual(['--gr-radius-control'])
    expect(grouped.unknown.map(token => token.name)).toEqual(['--gr-nope'])
  })
})
