import { computed, ref } from 'vue'

export type ThemeName = 'light' | 'dark'

export type UseThemeOptions = {
  /**
   * Ключ для хранения выбранной темы в localStorage.
   * По умолчанию: `fint-ds-theme`.
   */
  storageKey?: string

  /**
   * Если `false` — не читать/не писать localStorage (полезно для SSR/embedded сценариев).
   * По умолчанию: `true`.
   */
  persist?: boolean
}

const DEFAULT_STORAGE_KEY = 'fint-ds-theme'

function getPreferredTheme(storageKey = DEFAULT_STORAGE_KEY, persist = true): ThemeName {
  if (typeof window === 'undefined') return 'light'

  if (persist) {
    const storage = window.localStorage
    const stored = typeof storage?.getItem === 'function' ? storage.getItem(storageKey) : null
    if (stored === 'light' || stored === 'dark') return stored
  }

  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)')?.matches
  return prefersDark ? 'dark' : 'light'
}

function applyTheme(theme: ThemeName) {
  if (typeof document === 'undefined') return

  const root = document.documentElement
  root.classList.toggle('theme-dark', theme === 'dark')
  root.dataset.theme = theme
}

/**
 * Для применения темы максимально рано (до монтирования Vue), чтобы избежать "мигания".
 */
export function initThemeEarly(options: UseThemeOptions = {}) {
  const storageKey = options.storageKey ?? DEFAULT_STORAGE_KEY
  const persist = options.persist ?? true
  applyTheme(getPreferredTheme(storageKey, persist))
}

export function useTheme(options: UseThemeOptions = {}) {
  const storageKey = options.storageKey ?? DEFAULT_STORAGE_KEY
  const persist = options.persist ?? true

  const theme = ref<ThemeName>(getPreferredTheme(storageKey, persist))

  const isDark = computed(() => theme.value === 'dark')

  function setTheme(next: ThemeName) {
    theme.value = next

    if (persist && typeof window !== 'undefined') {
      const storage = window.localStorage
      if (typeof storage?.setItem === 'function')
        storage.setItem(storageKey, next)
    }

    applyTheme(next)
  }

  function toggleTheme() {
    setTheme(theme.value === 'dark' ? 'light' : 'dark')
  }

  function initTheme() {
    applyTheme(theme.value)
  }

  return {
    theme,
    isDark,
    setTheme,
    toggleTheme,
    initTheme,
  }
}