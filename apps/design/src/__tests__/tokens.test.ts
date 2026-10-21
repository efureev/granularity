import { describe, expect, it } from 'vitest'

import { grDerivedTokens, grFoundationTokens, grThemeCatalog, loadThemeData } from '@feugene/granularity-tokens'

import { foundationSection, modeValue, resolveColor, themeView } from '../app/tokens'

const views = await Promise.all(grThemeCatalog.map(async theme => themeView(await loadThemeData(theme.id))))
const sections = [...new Set(grFoundationTokens.map(token => token.section))]

describe('страницы основ строятся из данных показанной темы', () => {
  it.each(views.map(view => [view.id, view] as const))('%s: у каждой основы каждого раздела есть значение', (_, view) => {
    const empty = sections.flatMap(section => foundationSection(view, section).filter(token => !token.value).map(token => token.name))

    expect(empty).toEqual([])
  })

  it.each(views.map(view => [view.id, view] as const))('%s: колонки — режимы темы, текст и фон каждого разрешаются в цвет', (_, view) => {
    expect(view.modeList.map(mode => mode.id)).toEqual(Object.keys(view.data.modes))
    for (const mode of view.modeList) {
      expect(resolveColor(view, '--gr-fg', mode.id), `${view.id}/${mode.id}`).toMatch(/^#[\da-f]{6}$/)
      expect(resolveColor(view, '--gr-bg', mode.id), `${view.id}/${mode.id}`).toMatch(/^#[\da-f]{6}$/)
    }
  })

  it('темы различаются там, где различаются их данные', () => {
    const [clay, slate] = ['clay', 'slate'].map(id => views.find(view => view.id === id)!)
    const font = (view: typeof clay) => foundationSection(view, 'Typography: font families').find(token => token.name === '--gr-font-ui')?.value

    expect(font(clay)).toBe(clay.data.root['gr-font-ui'])
    expect(font(clay)).not.toBe(font(slate))
    expect(resolveColor(clay, '--gr-primary', 'light')).not.toBe(resolveColor(slate, '--gr-primary', 'light'))
  })

  it('производный токен: своё значение режима, если тема его задала, иначе — формула реестра', () => {
    const [clay, slate] = ['clay', 'slate'].map(id => views.find(view => view.id === id)!)
    const formula = grDerivedTokens.find(token => token.name === '--gr-danger-hover')?.formula

    expect(modeValue(clay, 'dark', '--gr-danger-hover')).toBe(clay.data.modes.dark?.tokens['gr-danger-hover'])
    expect(modeValue(clay, 'dark', '--gr-danger-hover')).not.toBe(formula)
    expect(modeValue(slate, 'dark', '--gr-danger-hover')).toBeUndefined()
  })
})
