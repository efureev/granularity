import { describe, expect, it } from 'vitest'

import { componentTokens, tokenSections } from '../resolve/tokenUsage'

function probe(values: Record<string, string>, inlineNames: string[] = []) {
  return { read: (name: string) => values[name] ?? '', inlineNames }
}

describe('реестр токенов компонента', () => {
  it('берёт только свои токены', () => {
    const owners = new Set(componentTokens('GrButton').map(token => token.name))

    expect(owners.size).toBeGreaterThan(0)
    expect([...owners].every(name => name.startsWith('--gr-button'))).toBe(true)
  })

  it('компонент без своих токенов даёт пустой список, а не исключение', () => {
    expect(componentTokens('GrNotAComponent')).toEqual([])
  })
})

describe('раскладка токенов', () => {
  it('разделяет применённые и оставшиеся без значения', () => {
    const [first, second] = componentTokens('GrButton')
    const sections = tokenSections('GrButton', probe({ [first!.name]: ' 0.375rem ' }))

    expect(sections.applied.map(token => token.name)).toContain(first!.name)
    expect(sections.applied.find(token => token.name === first!.name)?.value).toBe('0.375rem')
    expect(sections.unset.map(token => token.name)).toContain(second!.name)
  })

  it('`--gr-*` с опечаткой попадает в «не объявлен»', () => {
    const sections = tokenSections('GrButton', probe({ '--gr-buton-radius': '4px' }, ['--gr-buton-radius']))

    expect(sections.unknown).toEqual([{ name: '--gr-buton-radius', kind: 'unknown', value: '4px' }])
  })

  it('объявленный токен на элементе опечаткой не считается', () => {
    const known = componentTokens('GrButton')[0]!.name
    const sections = tokenSections('GrButton', probe({ [known]: '1px' }, [known]))

    expect(sections.unknown).toEqual([])
  })

  it('чужие переменные не трогаем: `--gr-*` — единственный префикс пакета', () => {
    const sections = tokenSections('GrButton', probe({ '--app-radius': '4px' }, ['--app-radius']))

    expect(sections.unknown).toEqual([])
  })
})
