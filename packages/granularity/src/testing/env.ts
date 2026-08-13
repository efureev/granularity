import { resetAnnouncer } from '../composables/useAnnouncer'
import { resetPortalRoot } from '../composables/internal/portalRoot'
import { useToast } from '../composables/useToast'

/**
 * Уборка между тестами.
 *
 * `document.body.innerHTML = ''` сам по себе оставляет пакет в разобранном
 * состоянии: корень портала и хост живого региона закэшированы модулями, и
 * после очистки `body` они указывают на узлы **вне документа**. Следующий
 * монтаж телепортирует туда оверлеи, тест ищет их в документе и не находит —
 * без единой ошибки в консоли. Очередь тостов переживает размонтирование по
 * замыслу, поэтому её тоже гасим.
 */
export function resetGranularityDom(): void {
  useToast().clear()
  resetAnnouncer()
  resetPortalRoot()

  if (typeof document !== 'undefined')
    document.body.innerHTML = ''
}

export interface StubMatchMediaOptions {
  /** Ответ на `(prefers-reduced-motion: reduce)`. */
  reducedMotion?: boolean
  /** Ответ на остальные запросы. */
  matches?: boolean
}

/**
 * Ответ `matchMedia` — например «пользователь просил меньше движения».
 *
 * Не для того, чтобы «не падало»: сам пакет зовёт `matchMedia` опционально и без
 * него живёт. Нужно, когда проверяется поведение **под** медиазапросом.
 * Возвращает функцию отката: глобальное состояние обязано уйти вместе с тестом.
 */
export function stubMatchMedia(options: StubMatchMediaOptions = {}): () => void {
  const { reducedMotion = false, matches = false } = options
  const original = window.matchMedia

  window.matchMedia = ((query: string) => ({
    media: query,
    matches: query.includes('prefers-reduced-motion') ? reducedMotion : matches,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }))

  return () => {
    window.matchMedia = original
  }
}
