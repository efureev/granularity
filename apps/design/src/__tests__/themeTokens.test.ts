import { grDerivedTokens, grFoundationTokens, grRoleTokens, grThemeCatalog, loadThemeData } from '@feugene/granularity-tokens'
import { describe, expect, it } from 'vitest'

import { SECTION_TITLES, themeComponentDefaults, themeComponentSections, themeTokenSections } from '../app/themeTokens'
import { themeView } from '../app/tokens'

describe('вкладка «Токены» темы', () => {
  it('у каждого раздела реестра есть русское название', () => {
    const sections = new Set([...grFoundationTokens, ...grRoleTokens, ...grDerivedTokens].map(token => token.section))
    expect([...sections].filter(section => !(section in SECTION_TITLES))).toEqual([])
  })

  it.each(grThemeCatalog.map(theme => theme.id))('тема %s: роль — в каждом режиме, примитив — в root, производное — по режимам', async (id) => {
    const view = themeView(await loadThemeData(id))
    const modes = view.modeList.map(mode => mode.id)

    const roles = themeTokenSections(view, 'roles').flatMap(section => section.rows)
    expect(roles).toHaveLength(grRoleTokens.length)
    expect(roles.filter(row => modes.some(mode => row.modes?.[mode] === undefined)).map(row => row.name)).toEqual([])

    const foundation = themeTokenSections(view, 'foundation').flatMap(section => section.rows)
    expect(foundation).toHaveLength(grFoundationTokens.length)
    expect(foundation.filter(row => row.value === undefined).map(row => row.name)).toEqual([])

    const derived = themeTokenSections(view, 'derived').flatMap(section => section.rows)
    expect(derived).toHaveLength(grDerivedTokens.length)
    expect(derived.every(row => modes.every(mode => row.modes?.[mode] !== undefined))).toBe(true)
  })

  it('производное без значения темы — формула пакета с пометкой', async () => {
    const view = themeView(await loadThemeData('slate'))
    const hover = themeTokenSections(view, 'derived').flatMap(section => section.rows).find(row => row.name === '--gr-primary-hover')!
    const formula = grDerivedTokens.find(token => token.name === '--gr-primary-hover')!.formula

    for (const mode of view.modeList) {
      if (hover.modes?.[mode.id] === formula)
        expect(hover.modeNotes?.[mode.id]).toBe('формула пакета')
      else
        expect(hover.modeNotes?.[mode.id]).toBeUndefined()
    }
  })

  it('значения компонентов и пропсы от темы — из её данных', async () => {
    const blueprint = await loadThemeData('blueprint')
    expect(themeComponentSections(blueprint).some(item => item.packageId === '@feugene/granularity' && item.component === 'GrButton' && item.values > 0)).toBe(true)
    expect(themeComponentDefaults(blueprint)).toEqual(expect.arrayContaining([{ component: 'GrButton', prop: 'loadingIndicator', value: 'track' }]))
    expect(themeComponentDefaults(await loadThemeData('slate'))).toEqual([])
  })
})
