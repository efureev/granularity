import { beforeEach, describe, expect, it, vi } from 'vitest'

import { initThemeEarly, useTheme } from '../useTheme'

const DEFAULT_STORAGE_KEY = 'fint-ds-theme'

describe('useTheme (helpers)', () => {
  beforeEach(() => {
    document.documentElement.className = ''
    delete document.documentElement.dataset.theme

    const storage = new Map<string, string>()
    const localStorageMock: Storage = {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => {
        storage.set(key, String(value))
      },
      removeItem: (key: string) => {
        storage.delete(key)
      },
      clear: () => {
        storage.clear()
      },
      key: (index: number) => [...storage.keys()][index] ?? null,
      get length() {
        return storage.size
      },
    }

    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      configurable: true,
    })
  })

  it('initThemeEarly should apply the preferred theme to the document', () => {
    window.localStorage.setItem(DEFAULT_STORAGE_KEY, 'light')
    initThemeEarly()
    expect(document.documentElement.classList.contains('theme-dark')).toBe(false)
    expect(document.documentElement.dataset.theme).toBe('light')

    window.localStorage.setItem(DEFAULT_STORAGE_KEY, 'dark')
    initThemeEarly()
    expect(document.documentElement.classList.contains('theme-dark')).toBe(true)
    expect(document.documentElement.dataset.theme).toBe('dark')
  })

  it('initThemeEarly should read from localStorage first', () => {
    window.localStorage.setItem(DEFAULT_STORAGE_KEY, 'dark')
    initThemeEarly()
    expect(document.documentElement.dataset.theme).toBe('dark')

    window.localStorage.setItem(DEFAULT_STORAGE_KEY, 'light')
    initThemeEarly()
    expect(document.documentElement.dataset.theme).toBe('light')
  })

  it('initThemeEarly should support custom storageKey', () => {
    window.localStorage.setItem('my-theme', 'dark')
    initThemeEarly({ storageKey: 'my-theme' })
    expect(document.documentElement.dataset.theme).toBe('dark')

    delete document.documentElement.dataset.theme
    document.documentElement.className = ''
    initThemeEarly()
    expect(document.documentElement.dataset.theme).toBe('light')
  })

  it('initThemeEarly should fallback to prefers-color-scheme when storage is empty', () => {
    const matchMedia = vi.fn().mockReturnValue({ matches: true })
    vi.stubGlobal('matchMedia', matchMedia)

    initThemeEarly()
    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(matchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)')
  })

  it('initThemeEarly should not throw when localStorage is missing getItem', () => {
    Object.defineProperty(window, 'localStorage', {
      value: {},
      configurable: true,
    })

    expect(() => initThemeEarly()).not.toThrow()
  })

  it('useTheme should persist into provided storageKey by default', () => {
    const { setTheme } = useTheme({ storageKey: 'app-theme' })
    setTheme('dark')

    expect(window.localStorage.getItem('app-theme')).toBe('dark')
    expect(window.localStorage.getItem(DEFAULT_STORAGE_KEY)).toBe(null)
    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(document.documentElement.classList.contains('theme-dark')).toBe(true)
  })

  it('useTheme should not touch localStorage when persist=false', () => {
    const { setTheme } = useTheme({ storageKey: 'app-theme', persist: false })
    setTheme('dark')

    expect(window.localStorage.getItem('app-theme')).toBe(null)
    expect(document.documentElement.dataset.theme).toBe('dark')
  })

  it('useTheme should not throw when localStorage is missing setItem', () => {
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: () => null,
      },
      configurable: true,
    })

    const { setTheme } = useTheme({ storageKey: 'app-theme' })
    expect(() => setTheme('dark')).not.toThrow()
    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(document.documentElement.classList.contains('theme-dark')).toBe(true)
  })
})