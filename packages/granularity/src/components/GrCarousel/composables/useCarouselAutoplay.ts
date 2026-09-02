import { computed, onScopeDispose, ref, watchEffect } from 'vue'
import type { ComputedRef } from 'vue'

export interface UseCarouselAutoplayOptions {
  /** Пауза между слайдами, мс. */
  interval: () => number
  /** Показ включён: проп задан и его никто не остановил. */
  enabled: () => boolean
  /**
   * Отсчёт приостановлен — курсор над лентой, идёт жест, вкладка в фоне.
   * Это **не** остановка: остаток сохраняется, и по снятию паузы лента
   * досчитывает его, а не начинает интервал заново.
   */
  paused: () => boolean
  /** Шаг ленты. */
  advance: () => void
}

export interface UseCarouselAutoplayReturn {
  /** Заведён ли отсчёт прямо сейчас. Пауза его снимает, намерение показа — нет. */
  running: ComputedRef<boolean>
  /** Забыть остаток и отсчитать интервал заново — после смены слайда извне. */
  restart: () => void
}

/**
 * Таймер автопрокрутки с паузой по остатку.
 *
 * Модель взята у `useToast` (`{ handle, remaining, startedAt }`), и `setInterval`
 * здесь не годится принципиально: паузу, сохраняющую остаток, на нём не
 * выразить — курсор, снятый за полсекунды до шага, откладывал бы шаг на полный
 * интервал.
 *
 * Композабл локальный: публичный потребовал бы записей в трёх реестрах пакета,
 * а переиспользовать его сегодня некому.
 */
export function useCarouselAutoplay(options: UseCarouselAutoplayOptions): UseCarouselAutoplayReturn {
  let handle: number | null = null
  let remaining = 0
  let startedAt = 0

  const armed = ref(false)

  function clear(): void {
    if (handle !== null) {
      clearTimeout(handle)
      handle = null
    }
    armed.value = false
  }

  function arm(): void {
    // На сервере таймеру взяться неоткуда, и заводить его там нечего.
    if (typeof window === 'undefined' || remaining <= 0)
      return

    startedAt = Date.now()
    armed.value = true
    handle = window.setTimeout(() => {
      handle = null
      remaining = options.interval()
      options.advance()

      // Шаг мог упереться в край без `loop` — тогда показ уже выключен.
      if (options.enabled() && !options.paused())
        arm()
      else clear()
    }, remaining)
  }

  function pause(): void {
    if (handle === null) {
      armed.value = false
      return
    }

    clearTimeout(handle)
    handle = null
    armed.value = false
    remaining = Math.max(0, remaining - (Date.now() - startedAt))
  }

  function restart(): void {
    clear()
    remaining = options.interval()
    if (options.enabled() && !options.paused())
      arm()
  }

  watchEffect(() => {
    // `interval()` читается ради зависимости: смена паузы обязана перезавести таймер.
    const ms = options.interval()

    if (!options.enabled() || options.paused() || ms <= 0) {
      pause()
      return
    }

    if (handle !== null)
      return

    if (remaining <= 0)
      remaining = ms

    arm()
  })

  onScopeDispose(clear)

  return { running: computed(() => armed.value), restart }
}
