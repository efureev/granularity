import type { Ref } from 'vue'
import { onUnmounted, watch } from 'vue'

import { pushOverlayLayer, removeOverlayLayer } from './internal/overlayStack'

export interface UseOverlayLayerOptions {
  /**
   * Модальный слой: блокирует страницу, и модалки под ним получают `inert`.
   * Немодальные (поповеры, меню, подсказки) участвуют только в очереди Esc.
   * По умолчанию `false`.
   */
  modal?: boolean
  /**
   * Закрывать ли слой по Esc. Геттер, а не значение, — чтобы читать реактивный
   * проп (`closeOnEsc`). По умолчанию закрывается всегда.
   *
   * Если геттер вернёт `false`, нажатие всё равно не пройдёт на слой ниже:
   * пользователь видит верхним этот слой, и Esc адресован ему.
   */
  closeOnEscape?: () => boolean
  /**
   * Уведомление «этот модальный слой сейчас верхний». Компонент вешает по нему
   * `inert` на свой корень, когда перестал быть верхним.
   */
  onTopmostChange?: (isTopmost: boolean) => void
  /**
   * Возвращать фокус элементу, который был активен до открытия. По умолчанию —
   * да. Отключать имеет смысл там, где фокус с триггера и не уходил: `GrSelect`
   * ведёт список через `aria-activedescendant`.
   */
  restoreFocus?: boolean
  /**
   * Корень слоя. Нужен для правила возврата фокуса: если на момент закрытия
   * фокус уже вне слоя, значит пользователь ушёл сам — забирать фокус обратно
   * нельзя.
   */
  root?: Ref<HTMLElement | null>
}

/**
 * Регистрирует оверлей в общем стеке слоёв, пока `open` истинно.
 *
 * Один контракт на порядок Esc, `inert` и возврат фокуса — три механизма,
 * которые обязаны видеть один и тот же порядок слоёв. Что берёт на себя:
 *
 *  - **Esc** — верхнему слою, вниз не проваливается;
 *  - **`inert`** — через `onTopmostChange` у модальных слоёв;
 *  - **возврат фокуса** — по единому правилу (см. ниже).
 *
 * Чего **не** делает: фокус-ловушку. У модальных оверлеев пакета её даёт
 * `Dialog` из HeadlessUI, и вторая ловушка поверх неё только конфликтовала бы.
 * Поповеру ловушка и не нужна: Tab обязан уводить фокус наружу и закрывать его.
 *
 * Правило возврата фокуса: восстанавливаем, **только если на момент закрытия
 * фокус всё ещё внутри слоя**. Если пользователь кликнул в другое поле, фокус
 * уже там — забирать его обратно нельзя. Эвристика «возвращать, если открыли с
 * клавиатуры» промахивается в обе стороны: мышью открытый слой фокус не вернёт,
 * а клавиатурный отберёт его у того, куда пользователь ушёл сам.
 */
export function useOverlayLayer(
  open: Ref<boolean>,
  onDismiss: () => void,
  options: UseOverlayLayerOptions = {},
): void {
  let layerId: number | null = null
  let previouslyFocused: HTMLElement | null = null

  function register(): void {
    if (layerId !== null) return

    if (options.restoreFocus !== false && typeof document !== 'undefined')
      previouslyFocused = (document.activeElement as HTMLElement) ?? null

    layerId = pushOverlayLayer({
      modal: options.modal ?? false,
      shouldClose: () => options.closeOnEscape?.() ?? true,
      close: onDismiss,
      setTopmost: options.onTopmostChange,
    })
  }

  function unregister(): void {
    if (layerId === null) return
    removeOverlayLayer(layerId)
    layerId = null

    restoreFocus()
  }

  function restoreFocus(): void {
    const target = previouslyFocused
    previouslyFocused = null

    if (options.restoreFocus === false || !target) return
    if (typeof document === 'undefined') return

    // Фокус уже вне слоя — пользователь ушёл сам, отбирать нельзя.
    const active = document.activeElement
    const root = options.root?.value
    if (root && active && active !== document.body && !root.contains(active)) return

    target.focus?.()
  }

  watch(
    open,
    (isOpen) => {
      if (isOpen) register()
      else unregister()
    },
    { immediate: true },
  )

  onUnmounted(unregister)
}
