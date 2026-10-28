import { resetAnnouncer } from '../composables/useAnnouncer'
import { resetPortalRoot } from '../composables/internal/portalRoot'
import { useToast } from '../composables/useToast'
import { runDomResets } from '../internal/domResets'

/**
 * Уборка между тестами.
 *
 * `document.body.innerHTML = ''` убирает узлы, но не модульное состояние
 * пакета, и оно переживает тест: очередь тостов (переживает и размонтирование —
 * по замыслу), таймеры живого региона и очередь сервиса диалогов вместе с
 * захваченным контекстом приложения. Неотвеченный диалог прошлого теста стоит
 * головой очереди, и новый не появляется вовсе — без единой ошибки в консоли.
 * Сервис диалогов записывает свою уборку сам (`internal/domResets`): подпуть
 * `testing` его граф не тянет.
 *
 * Приложения Vue помощник не размонтирует — это работа раннера
 * (`enableAutoUnmount` у `@vue/test-utils`): открытый слой несмонтированного
 * теста остался бы в стеке Esc и `inert` и держал бы блокировку прокрутки.
 */
export function resetGranularityDom(): void {
  useToast().clear()
  resetAnnouncer()
  resetPortalRoot()
  runDomResets()

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
  // Ссылка только сохраняется и возвращается на место — вызова в отрыве от
  // `window` нет, поэтому терять `this` тут нечему.
  // eslint-disable-next-line ts/unbound-method
  const original = window.matchMedia

  window.matchMedia = (query: string) => ({
    media: query,
    matches: query.includes('prefers-reduced-motion') ? reducedMotion : matches,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })

  return () => {
    window.matchMedia = original
  }
}
