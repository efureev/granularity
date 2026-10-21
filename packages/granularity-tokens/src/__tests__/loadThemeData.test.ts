import { describe, expect, it } from 'vitest'

import { grThemeCatalog } from '../generated'
import { loadThemeData } from '../loadThemeData'
import { grThemeDataLoaders } from '../themeData.generated'
import { themes } from './themes'

/**
 * `loadThemeData` — данные темы по требованию, по чанку на тему. Они обязаны
 * совпадать с тем, что собирает `loadTheme` из `themes/<slug>/`: страница,
 * показывающая значения текущей темы, иначе разошлась бы с её CSS.
 */
describe('loadThemeData', () => {
  it.each(themes.map(theme => [theme.id, theme] as const))('%s: полные данные — те же, что у loadTheme', async (id, theme) => {
    const { extends: _parent, sources: _sources, ...data } = theme as typeof theme & { extends?: string, sources?: string[] }

    expect(await loadThemeData(id)).toEqual(data)
  })

  it('загрузчик на каждую тему каталога, и только на них', () => {
    expect(Object.keys(grThemeDataLoaders)).toEqual(grThemeCatalog.map(theme => theme.id))
  })

  it('тема не из каталога — отказ со списком тем', async () => {
    await expect(loadThemeData('ink')).rejects.toThrow(/темы "ink" нет в каталоге — есть clay, slate/)
    await expect(loadThemeData('constructor')).rejects.toThrow(/нет в каталоге/)
  })
})
