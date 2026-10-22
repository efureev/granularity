import { grThemeCatalog, loadThemeData } from '@feugene/granularity-tokens'
import { grComponentTokens } from '@feugene/granularity/tokens'
import { describe, expect, it } from 'vitest'

import { buttonSnippet, buttonTokenGroups, initialPlayground, type PlaygroundState } from '../app/button/model'
import { componentDefaultsOf, groupTokenRows, themeTokenRows, tokenPreview } from '../app/componentTokens'

const buttonTokens = grComponentTokens.filter(token => token.owner === 'GrButton' || token.owner === 'GrButtonGroup')

describe('вкладка «Токены»: значения темы', () => {
  it('каждый токен вида theme ложится в группу', async () => {
    const rows = themeTokenRows(buttonTokens, await loadThemeData('slate'))
    expect(rows.length).toBeGreaterThan(0)
    expect(groupTokenRows(rows, buttonTokenGroups).unmatched.map(row => row.token.name)).toEqual([])
  })

  it.each(grThemeCatalog.map(theme => theme.id))('тема %s даёт значение каждому токену: в root или в каждом режиме', async (id) => {
    const data = await loadThemeData(id)
    const missing = themeTokenRows(buttonTokens, data)
      .filter(row => row.root === undefined && Object.keys(data.modes).some(mode => row.modes[mode] === undefined))
      .map(row => row.token.name)
    expect(missing).toEqual([])
  })

  it('образец — по смыслу токена, а не по значению', () => {
    expect(tokenPreview('--gr-button-primary-bg-hover')).toBe('color')
    expect(tokenPreview('--gr-button-primary-glow')).toBe('color')
    expect(tokenPreview('--gr-button-response-solid-color')).toBe('color')
    expect(tokenPreview('--gr-button-glow')).toBeUndefined()
    expect(tokenPreview('--gr-button-shadow-active')).toBe('shadow')
    expect(tokenPreview('--gr-button-radius-md')).toBe('radius')
    expect(tokenPreview('--gr-button-motion-duration')).toBeUndefined()
  })

  it('пропсы от темы — из componentDefaults', async () => {
    expect(componentDefaultsOf(await loadThemeData('blueprint'), 'GrButton')).toEqual({ loadingIndicator: 'track', prefixCell: true })
    expect(componentDefaultsOf(await loadThemeData('slate'), 'GrButton')).toEqual({})
  })
})

describe('песочница: шаблон кнопки', () => {
  const state = (patch: Partial<PlaygroundState>): PlaygroundState => ({ ...initialPlayground(), icon: 'none', ...patch })

  it('пропы, совпавшие с умолчанием, в шаблон не идут', () => {
    expect(buttonSnippet(state({}))).toBe('<GrButton>\n  Сохранить\n</GrButton>')
  })

  it('иконка слева — слот prefix, только иконка — square с именем', () => {
    expect(buttonSnippet(state({ icon: 'prefix' }))).toBe([
      '<GrButton>',
      '  <template #prefix>',
      '    <GrIcon><IconPlus /></GrIcon>',
      '  </template>',
      '  Сохранить',
      '</GrButton>',
    ].join('\n'))
    expect(buttonSnippet(state({ icon: 'only', label: 'Добавить' }))).toBe('<GrButton square aria-label="Добавить">\n  <GrIcon><IconPlus /></GrIcon>\n</GrButton>')
  })

  it('вид загрузки темы — без пропа, выбранный явно — пропом', () => {
    expect(buttonSnippet(state({ loading: true }))).toBe('<GrButton loading>\n  Сохранить\n</GrButton>')
    expect(buttonSnippet(state({ loading: true, indicator: 'track' }))).toBe('<GrButton loading loading-indicator="track">\n  Сохранить\n</GrButton>')
  })

  it('длинный открывающий тег — атрибут на строке', () => {
    expect(buttonSnippet(state({ variant: 'ghost-border', tone: 'danger', size: 'lg', loading: true, indicator: 'shimmer' }))).toBe([
      '<GrButton',
      '  variant="ghost-border"',
      '  tone="danger"',
      '  size="lg"',
      '  loading',
      '  loading-indicator="shimmer"',
      '>',
      '  Сохранить',
      '</GrButton>',
    ].join('\n'))
  })

  it('подпись экранируется: в тексте и в атрибуте', () => {
    expect(buttonSnippet(state({ label: '<b>"A&B"' }))).toBe('<GrButton>\n  &lt;b>"A&amp;B"\n</GrButton>')
    expect(buttonSnippet(state({ label: '"x"', icon: 'only' }))).toContain('aria-label="&quot;x&quot;"')
  })
})
