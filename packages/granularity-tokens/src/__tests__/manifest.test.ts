import { createThemeManifest } from '@feugene/granum/runtime'
import { describe, expect, it } from 'vitest'

import { GR_BASE_THEME_ID, grThemeManifest } from '../manifest'
import type { GrColorScheme } from '../types'
import { granularityTokensProvider } from '../granum-provider'
import slate from '../../themes/slate/theme.json'

describe('grThemeManifest', () => {
  it('у каталога нет темы по умолчанию; манифест без id — базовая тема пакета', () => {
    expect(granularityTokensProvider.theme).not.toHaveProperty('defaultTheme')
    expect(grThemeManifest().defaultTheme).toBe(GR_BASE_THEME_ID)
    expect(grThemeManifest().themes.map(theme => theme.id)).toEqual([GR_BASE_THEME_ID])
  })

  it('режимы каталога парами `<тема>-<режим>`, режим по умолчанию первым', () => {
    const theme = grThemeManifest('slate').themes[0]

    expect(theme.defaultMode).toBe(slate.defaultMode)
    expect(theme.modes[0]?.name).toBe(slate.defaultMode)
    expect(theme.modes.map(mode => [mode.name, mode.colorScheme, mode.value])).toEqual(
      Object.entries(slate.modes).map(([name, mode]) => [name, mode.colorScheme, `slate-${name}`]),
    )
    expect(grThemeManifest('slate').activation.attribute).toBe('data-theme')
  })

  // Пакет не зависит от granum в рантайме: манифест для готового листа нужен
  // как раз приложению без него. Правило пары держит этот тест.
  it('совпадает с createThemeManifest granum по той же теме', () => {
    const manifest = grThemeManifest('slate')

    expect(manifest).toEqual(createThemeManifest({
      themes: [{
        id: manifest.defaultTheme,
        title: manifest.themes[0].title,
        modes: Object.entries(slate.modes).map(([name, mode]) => ({ name, ...mode })) as Array<{ name: string, title?: string, colorScheme: GrColorScheme }>,
        defaultMode: slate.defaultMode,
      }],
    }))
  })

  it('неизвестная тема — ошибка со списком каталога', () => {
    expect(() => grThemeManifest('nope')).toThrow(/slate/)
  })
})
