import { onMounted, ref } from 'vue'

/**
 * Контроллер тем приложения.
 *
 * Почему не `useTheme()` из пакета: он типизирован как `'light' | 'dark'` и
 * умеет ровно две темы (см. `docs/theming.md` → «Переключение в рантайме»).
 * Третью он переключить не может, поэтому приложение с собственной темой
 * заводит свой контроллер. Переиспользуется при этом контракт селектора —
 * атрибут `[data-theme]` на `<html>`, — а не сам композабл.
 */

export const APP_THEMES = ['light', 'dark', 'ocean', 'contrast'] as const

export type AppTheme = (typeof APP_THEMES)[number]

const STORAGE_KEY = 'playground-theme'

function readStoredTheme(): AppTheme | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return APP_THEMES.includes(stored as AppTheme) ? stored as AppTheme : null
  }
  catch {
    return null
  }
}

function applyTheme(theme: AppTheme): void {
  document.documentElement.dataset.theme = theme
  // `.theme-dark` — deprecated-алиас пакета; поддерживаем ради стороннего кода,
  // который на него ещё смотрит.
  document.documentElement.classList.toggle('theme-dark', theme === 'dark')
}

export function useAppTheme() {
  const theme = ref<AppTheme>('light')

  // Начальное значение уже проставлено инлайновым скриптом в `index.html`
  // (иначе была бы вспышка чужой темы) — здесь только синхронизируем состояние.
  onMounted(() => {
    theme.value = readStoredTheme()
      ?? (document.documentElement.dataset.theme as AppTheme | undefined)
      ?? 'light'
  })

  function setTheme(next: AppTheme): void {
    theme.value = next
    applyTheme(next)

    try {
      localStorage.setItem(STORAGE_KEY, next)
    }
    catch {
      // приватный режим Safari — не повод падать
    }
  }

  return { theme, setTheme }
}
