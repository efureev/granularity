import { createThemeManifest } from '@feugene/granum/runtime'
import { describe, expect, it } from 'vitest'

import { GR_DEFAULT_THEME_ID, grThemeManifest } from '../manifest'
import type { GrColorScheme } from '../types'
import { granularityTokensProvider } from '../granum-provider'
import slate from '../../themes/slate/theme.json'

describe('grThemeManifest', () => {
  it('тема по умолчанию — та же, что объявляет провайдер granum', () => {
    expect(granularityTokensProvider.theme?.defaultTheme).toBe(GR_DEFAULT_THEME_ID)
    expect(grThemeManifest().defaultTheme).toBe(GR_DEFAULT_THEME_ID)
    expect(grThemeManifest().themes.map(theme => theme.id)).toEqual([GR_DEFAULT_THEME_ID])
  })

  it('режимы каталога парами `<тема>-<режим>`, режим по умолчанию первым', () => {
    const theme = grThemeManifest('slate').themes[0]

    expect(theme.defaultMode).toBe(slate.defaultMode)
    expect(theme.modes[0]?.name).toBe(slate.defaultMode)
    expect(theme.modes.map(mode => [mode.name, mode.colorScheme, mode.value])).toEqual(
      slate.modes.map(mode => [mode.name, mode.colorScheme, `slate-${mode.name}`]),
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
        modes: slate.modes as Array<{ name: string, title?: string, colorScheme: GrColorScheme }>,
        defaultMode: slate.defaultMode,
      }],
    }))
  })

  it('неизвестная тема — ошибка со списком каталога', () => {
    expect(() => grThemeManifest('nope')).toThrow(/slate/)
  })
})
