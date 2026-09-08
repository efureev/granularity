import { createApp } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { granularityHotkeysPlugin, resetHotkeysRegistry, useHotkeys } from '../useHotkeys'

/**
 * Реестр нужен затем, чтобы сочетание не писалось дважды — в привязке и в
 * подсказке — и не расходилось молча.
 */
function withApp<T>(hotkeys: Record<string, { keys: string, label?: string }>, fn: () => T): T {
  const app = createApp({ render: () => null })
  app.use(granularityHotkeysPlugin, { hotkeys })

  return app.runWithContext(fn)
}

afterEach(() => {
  resetHotkeysRegistry()
})

describe('useHotkeys', () => {
  it('отдаёт сочетание и подпись по id', () => {
    withApp({ 'search.open': { keys: 'mod+k', label: 'Открыть поиск' } }, () => {
      const { keysOf, labelOf } = useHotkeys()

      expect(keysOf('search.open')).toBe('mod+k')
      expect(labelOf('search.open')).toBe('Открыть поиск')
    })
  })

  it('`register` добавляет запись, которой не было при установке плагина', () => {
    withApp({}, () => {
      const { register, keysOf } = useHotkeys()

      register('issues.goto', { keys: 'g i' })
      expect(keysOf('issues.goto')).toBe('g i')
    })
  })

  /**
   * Молча вернув `undefined`, реестр дал бы исчезнувшую подсказку и
   * непривязанный хоткей — оба симптома выглядят как «забыли сделать».
   */
  it('неизвестный id — предупреждение, а не тишина', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    withApp({}, () => {
      expect(useHotkeys().keysOf('typo.here')).toBeUndefined()
    })

    expect(warn.mock.calls.map(call => String(call[0])).join('\n')).toContain('typo.here')
    warn.mockRestore()
  })

  it('`byHotkeyId` разворачивает id в сочетание для директивы', () => {
    withApp({
      'search.open': { keys: 'mod+k' },
      'issues.goto': { keys: 'g i' },
    }, () => {
      const open = () => {}
      const goto = () => {}

      const map = useHotkeys().byHotkeyId({ 'search.open': open, 'issues.goto': goto })

      expect(map).toEqual({ 'mod+k': open, 'g i': goto })
    })
  })

  it('неизвестный id в `byHotkeyId` не превращается в сочетание-призрак', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    withApp({}, () => {
      expect(useHotkeys().byHotkeyId({ 'typo.here': () => {} })).toEqual({})
    })

    warn.mockRestore()
  })

  /** Реестры приложений изолированы: иначе микрофронтенды делили бы один. */
  it('у каждого приложения свой реестр', () => {
    const first = withApp({ a: { keys: 'g a' } }, () => useHotkeys().keysOf('a'))
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const second = withApp({ b: { keys: 'g b' } }, () => useHotkeys().keysOf('a'))
    warn.mockRestore()

    expect(first).toBe('g a')
    expect(second).toBeUndefined()
  })
})
