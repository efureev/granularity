// @vitest-environment node

import { createApp } from 'vue'
import { describe, expect, it } from 'vitest'

import { granularityThemePlugin, type GrThemeManifest, useTheme, type UseThemeOptions } from '../useTheme'

/**
 * Состояние темы на сервере. Окружение — настоящий Node: в jsdom `window` есть,
 * и серверная ветка `useTheme` не исполнялась бы.
 */
const MANIFEST: GrThemeManifest = {
  themes: [
    {
      id: 'slate',
      title: 'Сланец',
      modes: [{ name: 'light', colorScheme: 'light', value: 'slate-light' }, { name: 'dark', colorScheme: 'dark', value: 'slate-dark' }],
      defaultMode: 'light',
    },
    {
      id: 'clay',
      title: 'Глина',
      modes: [{ name: 'light', colorScheme: 'light', value: 'clay-light' }, { name: 'dark', colorScheme: 'dark', value: 'clay-dark' }],
      defaultMode: 'dark',
      href: '/assets/granum-theme-clay.css',
    },
  ],
  defaultTheme: 'slate',
  activation: { attribute: 'data-theme' },
}

function serverState(initial?: UseThemeOptions['initial']) {
  const app = createApp({})
  app.use(granularityThemePlugin, { manifest: MANIFEST, ...(initial !== undefined ? { initial } : {}) })
  return app.runWithContext(() => useTheme())
}

describe('useTheme на сервере', () => {
  it('initial из cookie — тема и режим запроса: по ним компоненты берут пропсы по умолчанию', () => {
    const theme = serverState({ theme: 'clay', mode: 'light' })
    expect(theme.theme.value).toBe('clay')
    expect(theme.mode.value).toBe('light')
    expect(theme.modes.map(mode => mode.value)).toEqual(['clay-light', 'clay-dark'])
  })

  it('setTheme — по правилу контроллера: режим той же схемы, чужой режим — отказ', async () => {
    const theme = serverState({ theme: 'slate', mode: 'dark' })
    await theme.setTheme('clay')
    expect(`${theme.theme.value}/${theme.mode.value}`).toBe('clay/dark')
    expect(theme.modes.map(mode => mode.value)).toEqual(['clay-light', 'clay-dark'])
    await expect(theme.setTheme('slate', { mode: 'dim' })).rejects.toThrow(/mode 'dim'/)
    await expect(theme.setTheme('ink')).rejects.toThrow(/theme 'ink' is not in the build/)
  })

  it('без плагина запись — синхронная ошибка: отклонённый промис на сервере никто бы не ждал', () => {
    const app = createApp({})
    const theme = app.runWithContext(() => useTheme({ manifest: MANIFEST }))
    expect(() => theme.setTheme('clay')).toThrow(/granularityThemePlugin/)
  })

  it('initial не из сборки — ошибка, как у контроллера на клиенте', () => {
    expect(() => serverState({ theme: 'gone' })).toThrow(/theme 'gone' is not in the build/)
    expect(() => serverState({ theme: 'clay', mode: 'ocean' })).toThrow(/mode 'ocean'/)
  })

  it('без режима — режим по умолчанию темы; имя режима — режим основной темы', () => {
    expect(serverState({ theme: 'clay' }).mode.value).toBe('dark')
    const plain = serverState('dark')
    expect(`${plain.theme.value}/${plain.mode.value}`).toBe('slate/dark')
    const none = serverState()
    expect(`${none.theme.value}/${none.mode.value}`).toBe('slate/light')
  })
})
