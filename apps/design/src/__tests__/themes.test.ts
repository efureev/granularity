import { describe, expect, it } from 'vitest'

import { grThemeCatalog } from '@feugene/granularity-tokens'
import type { GranumThemeManifest } from '@feugene/granum/runtime'

import granumConfig from '../../granum.config'
import { designThemes, findDesignTheme, previewThemeIds, themeModes } from '../app/themes'

const manifest: GranumThemeManifest = {
  theme: { id: 'slate', title: 'Сланец' },
  modes: [
    { name: 'light', colorScheme: 'light', value: 'slate-light' },
    { name: 'dark', colorScheme: 'dark', value: 'slate-dark' },
  ],
  defaultMode: 'light',
  activation: { attribute: 'data-theme', value: '{theme}-{mode}' },
  previews: [{ theme: { id: 'clay', title: 'Глина' }, modes: [{ name: 'light', colorScheme: 'light', value: 'clay-light' }] }],
}

describe('раздел «Темы»', () => {
  it('конфиг granum собирает превью всех тем каталога, кроме активной', () => {
    expect(granumConfig.previews).toEqual(previewThemeIds(String(granumConfig.theme)))
    expect(previewThemeIds('slate')).toEqual(grThemeCatalog.map(theme => theme.id).filter(id => id !== 'slate'))
  })

  it('каждая тема каталога — страница; где она в сборке, говорит манифест', () => {
    const themes = designThemes(manifest)

    expect(themes.map(theme => theme.entry.id)).toEqual(grThemeCatalog.map(theme => theme.id))
    expect(findDesignTheme(manifest, 'slate')).toMatchObject({ build: 'active', modes: manifest.modes })
    expect(findDesignTheme(manifest, 'missing')).toBeUndefined()
  })

  it('режимы островов: активной темы, темы превью; темы вне сборки — пусто', () => {
    expect(themeModes(manifest).map(mode => mode.value)).toEqual(['slate-light', 'slate-dark'])
    expect(themeModes(manifest, 'clay').map(mode => mode.value)).toEqual(['clay-light'])
    expect(themeModes(manifest, 'tactile')).toEqual([])
  })
})
