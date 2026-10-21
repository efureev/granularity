import { describe, expect, it } from 'vitest'

import { grThemeCatalog } from '@feugene/granularity-tokens'
import type { GranumThemeManifest } from '@feugene/granum/runtime'

import granumConfig from '../../granum.config'
import { buildThemes, designThemes, findDesignTheme, islandTheme, themeModes } from '../app/themes'

const slateModes = [
  { name: 'light', colorScheme: 'light' as const, value: 'slate-light' },
  { name: 'dark', colorScheme: 'dark' as const, value: 'slate-dark' },
]
const manifest: GranumThemeManifest = {
  themes: [
    { id: 'slate', title: 'Сланец', modes: slateModes, defaultMode: 'light' },
    { id: 'clay', title: 'Глина', modes: [{ name: 'light', colorScheme: 'light', value: 'clay-light' }], defaultMode: 'light', href: '/assets/granum-theme-clay.css' },
  ],
  defaultTheme: 'slate',
  activation: { attribute: 'data-theme', value: '{theme}-{mode}' },
}

describe('раздел «Темы»', () => {
  it('конфиг granum собирает все темы каталога со всеми режимами; основная — slate', () => {
    expect(granumConfig.themes).toEqual(buildThemes('slate'))
    expect(buildThemes('slate').map(theme => `${theme.theme}${theme.default ? '*' : ''}`)).toEqual(grThemeCatalog.map(theme => `${theme.id}${theme.id === 'slate' ? '*' : ''}`))
    expect(buildThemes('slate').find(theme => theme.theme === 'clay')?.modes).toEqual(grThemeCatalog.find(theme => theme.id === 'clay')!.modes.map(mode => mode.name))
  })

  it('каждая тема каталога — страница; где она в сборке, говорит манифест', () => {
    const themes = designThemes(manifest)

    expect(themes.map(theme => theme.entry.id)).toEqual(grThemeCatalog.map(theme => theme.id))
    expect(findDesignTheme(manifest, 'slate')).toMatchObject({ build: 'default', modes: slateModes })
    expect(findDesignTheme(manifest, 'clay')).toMatchObject({ build: 'built' })
    expect(findDesignTheme(manifest, 'missing')).toBeUndefined()
  })

  it('острова — с явной темой, и у основной: тему документа переключают', () => {
    expect(islandTheme(findDesignTheme(manifest, 'slate')!)).toBe('slate')
    expect(islandTheme(findDesignTheme(manifest, 'clay')!)).toBe('clay')
    expect(islandTheme({ ...findDesignTheme(manifest, 'clay')!, build: 'absent' })).toBeUndefined()
  })

  it('режимы островов: основной темы, дополнительной; темы вне сборки — пусто', () => {
    expect(themeModes(manifest).map(mode => mode.value)).toEqual(['slate-light', 'slate-dark'])
    expect(themeModes(manifest, 'clay').map(mode => mode.value)).toEqual(['clay-light'])
    expect(themeModes(manifest, 'tactile')).toEqual([])
  })
})
