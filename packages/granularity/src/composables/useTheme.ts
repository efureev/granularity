import { computed, ref } from 'vue'
import type { Ref } from 'vue'

export type ThemeName = 'light' | 'dark'

export type UseThemeOptions = {
  /**
   * Ключ для хранения выбранной темы в localStorage.
   * По умолчанию: `gr-theme`.
   */
  storageKey?: string

  /**
   * Если `false` — не читать/не писать localStorage (полезно для SSR/embedded сценариев).
   * По умолчанию: `true`.
   */
  persist?: boolean
}

const DEFAULT_STORAGE_KEY = 'gr-theme'

function readStoredTheme(storageKey: string, persist: boolean): ThemeName | null {
  if (typeof window === 'undefined' || !persist) return null

  // Доступ к `localStorage` может бросать `SecurityError` в Safari private mode
  // и при отключённых cookies/storage — поэтому оборачиваем в try/catch.
  try {
    const storage = window.localStorage
    if (typeof storage?.getItem !== 'function') return null

    const stored = storage.getItem(storageKey)
    if (stored === 'light' || stored === 'dark') return stored
  }
  catch {
    // ignore
  }

  return null
}

function getSystemTheme(): ThemeName {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia?.('(prefers-color-scheme: dark)')?.matches ? 'dark' : 'light'
}

function getPreferredTheme(storageKey = DEFAULT_STORAGE_KEY, persist = true): ThemeName {
  return readStoredTheme(storageKey, persist) ?? getSystemTheme()
}

function applyTheme(theme: ThemeName) {
  if (typeof document === 'undefined') return

  const root = document.documentElement
  // Канон DS — атрибут `[data-theme]` на `<html>` (см. docs/styling.md → «Темизация»).
  // `useTheme`/`initThemeEarly` — единственный рантайм-API переключения темы.
  root.dataset.theme = theme
  // Класс `.theme-dark` — deprecated-алиас для обратной совместимости; в новом коде
  // ориентируйтесь на `[data-theme]`.
  root.classList.toggle('theme-dark', theme === 'dark')
}

// Модульный shared-синглтон состояния темы: единый источник истины для ВСЕХ
// вызовов `useTheme()` (по образцу `useToast`). Раньше каждый вызов создавал
// собственный `ref`, из-за чего переключение темы в компоненте A не обновляло
// `theme`/`isDark` в компоненте B (менялся только DOM-класс) — та самая
// рассинхронизация. Теперь ref один, реактивность консистентна.
const sharedTheme: Ref<ThemeName> = ref<ThemeName>(getPreferredTheme())

// Активные ключ/persist, которыми синглтон инициализирован (нужны слушателям
// `storage`/`matchMedia`, чтобы знать, какой ключ отслеживать).
let activeStorageKey = DEFAULT_STORAGE_KEY
let activePersist = true
let listenersBound = false

// Подписки на системную тему и синхронизацию между вкладками. Живут на уровне
// модуля (как таймеры в `useToast`): состояние общее, поэтому подписка нужна
// одна на приложение, а не per-consumer — здесь `onScopeDispose` был бы вреден
// (порвал бы shared-подписку при размонтировании одного из потребителей).
function bindListeners() {
  if (listenersBound || typeof window === 'undefined') return
  listenersBound = true

  // Cross-tab: другая вкладка записала тему в localStorage.
  window.addEventListener?.('storage', (event: StorageEvent) => {
    if (!activePersist || event.key !== activeStorageKey) return
    if (event.newValue === 'light' || event.newValue === 'dark') {
      sharedTheme.value = event.newValue
      applyTheme(event.newValue)
    }
  })

  // Системная смена `prefers-color-scheme` — следуем ей только если пользователь
  // НЕ выбрал тему явно (в storage ничего не сохранено).
  const mql = window.matchMedia?.('(prefers-color-scheme: dark)')
  mql?.addEventListener?.('change', (event: MediaQueryListEvent) => {
    if (readStoredTheme(activeStorageKey, activePersist) !== null) return
    const next: ThemeName = event.matches ? 'dark' : 'light'
    sharedTheme.value = next
    applyTheme(next)
  })
}

/**
 * Для применения темы максимально рано (до монтирования Vue), чтобы избежать "мигания".
 * Также сидирует shared-синглтон, чтобы значение в `useTheme()` совпадало с уже
 * применённым к документу.
 */
export function initThemeEarly(options: UseThemeOptions = {}) {
  const storageKey = options.storageKey ?? DEFAULT_STORAGE_KEY
  const persist = options.persist ?? true
  const preferred = getPreferredTheme(storageKey, persist)

  activeStorageKey = storageKey
  activePersist = persist
  sharedTheme.value = preferred
  applyTheme(preferred)
}

export function useTheme(options: UseThemeOptions = {}) {
  const storageKey = options.storageKey ?? DEFAULT_STORAGE_KEY
  const persist = options.persist ?? true

  activeStorageKey = storageKey
  activePersist = persist
  bindListeners()

  const theme = sharedTheme
  const isDark = computed(() => theme.value === 'dark')

  function setTheme(next: ThemeName) {
    theme.value = next

    if (persist && typeof window !== 'undefined') {
      // См. комментарий в `readStoredTheme`: запись тоже может бросать.
      try {
        const storage = window.localStorage
        if (typeof storage?.setItem === 'function')
          storage.setItem(storageKey, next)
      }
      catch {
        // ignore
      }
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
