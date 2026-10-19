import { describe, expect, it } from 'vitest'

import { GR_DEFAULT_THEME_ID, grThemeManifest } from '../manifest'
import { granularityTokensProvider } from '../granum-provider'
import slate from '../../themes/slate/theme.json'

describe('grThemeManifest', () => {
  it('тема по умолчанию — та же, что объявляет провайдер granum', () => {
    expect(granularityTokensProvider.theme?.defaultTheme).toBe(GR_DEFAULT_THEME_ID)
    expect(grThemeManifest().theme.id).toBe(GR_DEFAULT_THEME_ID)
  })

  it('режимы каталога парами `<тема>-<режим>`, режим по умолчанию первым', () => {
    const manifest = grThemeManifest('slate')

    expect(manifest.defaultMode).toBe(slate.defaultMode)
    expect(manifest.modes[0]?.name).toBe(slate.defaultMode)
    expect(manifest.modes.map(mode => [mode.name, mode.colorScheme, mode.value])).toEqual(
      slate.modes.map(mode => [mode.name, mode.colorScheme, `slate-${mode.name}`]),
    )
    expect(manifest.activation.attribute).toBe('data-theme')
  })

  it('неизвестная тема — ошибка со списком каталога', () => {
    expect(() => grThemeManifest('nope')).toThrow(/slate/)
  })
})
