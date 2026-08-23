import type { Ref } from 'vue'
import { nextTick, onUnmounted, watch } from 'vue'

import { layerRootsAbove, pushOverlayLayer, removeOverlayLayer } from './internal/overlayStack'

export interface UseOverlayLayerOptions {
  /**
   * Модальный слой: блокирует страницу, и модалки под ним получают `inert`.
   * Немодальные (поповеры, меню, подсказки) участвуют только в очереди Esc.
   * По умолчанию `false`.
   *
   * Геттером — там, где модальность включается пропом (`GrDrawer`): значение
   * читается в момент регистрации, то есть при каждом открытии.
   */
  modal?: boolean | (() => boolean)
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
   * Корень слоя. Нужен дважды: для правила возврата фокуса (если на момент
   * закрытия фокус уже вне слоя, пользователь ушёл сам — забирать нельзя) и
   * для ловушки фокуса слоя под ним, которая обязана считать этот корень
   * своим (панель селекта внутри модалки телепортирована в `body`).
   */
  root?: Ref<HTMLElement | null>
}

export interface OverlayLayerHandle {
  /**
   * Корни слоёв, открытых поверх этого. Передаётся в `useFocusTrap` как
   * `containers`: пока панель, открытая изнутри окна, жива, фокус в ней
   * законен.
   */
  rootsAbove: () => HTMLElement[]
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
 * Чего **не** делает: фокус-ловушку — это `useFocusTrap`, отдельный примитив.
 * Поповеру ловушка и не нужна: Tab обязан уводить фокус наружу и закрывать его,
 * поэтому связка «слой + ловушка» собирается в компоненте, а не тут.
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
): OverlayLayerHandle {
  let layerId: number | null = null
  let previouslyFocused: HTMLElement | null = null

  function register(): void {
    if (layerId !== null)
      return

    // Стек — браузерное понятие: Esc, `inert` и возврат фокуса на сервере
    // бессмысленны. Регистрируйся слой и там — он остался бы в модульном массиве
    // навсегда, потому что `onUnmounted` при `renderToString` не вызывается, и
    // каждый серверный рендер открытого оверлея копил бы замыкание со ссылками
    // на свои компоненты.
    if (typeof window === 'undefined')
      return

    if (options.restoreFocus !== false && typeof document !== 'undefined')
      previouslyFocused = (document.activeElement as HTMLElement) ?? null

    layerId = pushOverlayLayer({
      modal: typeof options.modal === 'function' ? options.modal() : options.modal ?? false,
      shouldClose: () => options.closeOnEscape?.() ?? true,
      close: onDismiss,
      setTopmost: options.onTopmostChange,
      root: () => options.root?.value ?? null,
    })
  }

  function unregister(): void {
    if (layerId === null)
      return
    removeOverlayLayer(layerId)
    layerId = null

    restoreFocus()
  }

  function restoreFocus(): void {
    const target = previouslyFocused
    previouslyFocused = null

    if (options.restoreFocus === false || !target)
      return
    if (typeof document === 'undefined')
      return

    // Фокус уже вне слоя — пользователь ушёл сам, отбирать нельзя. Решение
    // принимаем сейчас, пока слой ещё в DOM, а применяем следующим тиком.
    const active = document.activeElement
    const root = options.root?.value
    if (root && active && active !== document.body && !root.contains(active))
      return

    // Возврат откладывается намеренно: ловушка фокуса того же слоя снимает свои
    // слушатели в этом же флаше, и сфокусируй мы триггер сразу — она затащила бы
    // фокус обратно в закрывающийся слой.
    void nextTick(() => {
      if (target.isConnected)
        target.focus?.()
    })
  }

  watch(
    open,
    (isOpen) => {
      if (isOpen)
        register()
      else unregister()
    },
    { immediate: true },
  )

  onUnmounted(unregister)

  return {
    rootsAbove: () => (layerId === null ? [] : layerRootsAbove(layerId)),
  }
}
