import type { CSSProperties, Ref } from 'vue'
import type { Middleware, Placement, VirtualElement } from '@floating-ui/dom'
import { autoUpdate, computePosition, flip, offset as offsetMiddleware, shift, size as sizeMiddleware } from '@floating-ui/dom'
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'

import { floatingLayerZIndex } from './internal/overlayStack'

export type UseFloatingPlacement = Placement

/**
 * Кастомное свойство, в которое слой пишет доступное место по вертикали —
 * расстояние от панели до края вьюпорта на той стороне, куда её в итоге
 * поставило.
 *
 * Свойство ставится на сам плавающий элемент при каждом пересчёте позиции, в
 * том числе на скролле и ресайзе. Слой **сообщает замер, а не применяет его**:
 * ограничивать ли себя этим числом и что при этом скроллить — решает панель,
 * потому что скролл принадлежит её содержимому.
 *
 * Ширину так публиковать незачем: её потолок статичен (`calc(100vw - 1rem)`) и
 * замера не требует. Высота статичной быть не может — доступное место зависит
 * от того, где стоит триггер.
 */
export const floatingAvailableHeightVar = '--gr-floating-available-height'

/**
 * Device pixel ratio плавающего элемента. Нужен, чтобы округлять координаты к сетке
 * физических пикселей (см. `roundByDPR`) — иначе субпиксельные `left/top` дают размытый
 * текст/границы панели на не-целочисленных позициях и HiDPI-экранах. Подход перенят у
 * официального `@floating-ui/vue` (`useFloating` → `roundByDPR`), чтобы не тянуть весь
 * пакет ради одной утилиты.
 */
function getDpr(element: HTMLElement): number {
  if (typeof window === 'undefined')
    return 1

  const win = element.ownerDocument?.defaultView ?? window
  return win.devicePixelRatio || 1
}

function roundByDpr(element: HTMLElement, value: number): number {
  const dpr = getDpr(element)
  return Math.round(value * dpr) / dpr
}

/**
 * Прямоугольник в координатах вьюпорта — якорь, которого нет в DOM.
 *
 * Точка курсора описывается прямоугольником `0×0`. Размеры необязательны именно
 * поэтому: контекстное меню, открытое с клавиатуры, встаёт у **прямоугольника**
 * сфокусированной строки, а не у её угла, и переворачивается вместе с ней.
 */
export interface GrFloatingAnchorRect {
  x: number
  y: number
  /** По умолчанию 0. */
  width?: number
  /** По умолчанию 0. */
  height?: number
}

/** Ссылка позиционирования: элемент, виртуальный якорь или ничего. */
export type UseFloatingReference = HTMLElement | VirtualElement | null

/**
 * Виртуальный якорь: объект создаётся один раз, координаты читает геттер на
 * каждом измерении.
 *
 * Стабильность объекта здесь не стилистика, а условие работы: `useFloating`
 * пересоздаёт подписку `autoUpdate` при смене самой ссылки, поэтому новый объект
 * на каждое движение курсора рвал бы и заводил её заново. С одним объектом смена
 * точки — это просто `update()`.
 */
export function createFloatingAnchor(
  get: () => GrFloatingAnchorRect | null | undefined,
  options: { contextElement?: () => Element | null | undefined } = {},
): VirtualElement {
  return {
    getBoundingClientRect() {
      const rect = get() ?? { x: 0, y: 0 }
      const width = rect.width ?? 0
      const height = rect.height ?? 0

      return {
        x: rect.x,
        y: rect.y,
        width,
        height,
        top: rect.y,
        left: rect.x,
        right: rect.x + width,
        bottom: rect.y + height,
      }
    },
    get contextElement() {
      return options.contextElement?.() ?? undefined
    },
  }
}

export interface UseFloatingOptions {
  /**
   * Предпочитаемое место панели относительно триггера. По умолчанию `bottom-start`.
   * Можно передать функцию-геттер, если место зависит от реактивного пропа
   * (например, `align`) — она вызывается заново при каждом пересчёте позиции.
   */
  placement?: UseFloatingPlacement | (() => UseFloatingPlacement)
  /** Зазор между триггером и панелью, px. По умолчанию `8`. */
  offsetPx?: number
  /** Минимальный отступ от края viewport при flip/shift, px. По умолчанию `8`. */
  boundaryPadding?: number
  /**
   * Согласовать ширину панели с шириной триггера (актуально для Select/TreeSelect).
   * Не годится для Dropdown/Tooltip, где ширина панели определяется контентом.
   * - `true` — точная ширина (`width = ширина триггера`);
   * - `'min'` — панель растёт по контенту (`width: max-content`), но не уже триггера
   *   (`min-width = ширина триггера`) — режим `GrSelect view="link"`;
   * - функция-геттер — как и `placement`, для реактивной зависимости от пропа.
   *
   * С виртуальным якорем не работает: ширина точки равна нулю.
   */
  matchWidth?: boolean | 'min' | (() => boolean | 'min')
  /**
   * CSS-переменная шкалы слоёв (см. `styles/tokens.css`). По умолчанию
   * `--gr-z-dropdown`. Действует, пока панель открыта вне модального окна: над
   * окном высоту задаёт стек слоёв (см. {@link floatingZIndex}).
   */
  zIndexVar?: string
}

export interface UseFloatingReturn {
  /** Готовый объект для `:style` на плавающем элементе. */
  floatingStyle: Ref<CSSProperties>
  /**
   * Итоговое место панели ПОСЛЕ применения `flip` — может отличаться от запрошенного
   * `placement`, если места не хватило и панель перевернуло на противоположную сторону.
   * Полезно для выбора `transform-origin`/направления transition в потребителе.
   */
  resolvedPlacement: Ref<Placement>
  /** Принудительный пересчёт позиции (например, после изменения контента панели). */
  update: () => void
}

/**
 * Единый движок позиционирования floating-панелей (Dropdown/Select/TreeSelect/Tooltip)
 * поверх `@floating-ui/dom`: flip (переворот при нехватке места), shift (клэмп к границам
 * viewport), опциональный `size`-мидлвар для растягивания по ширине триггера.
 *
 * Пересчёт положения при скролле/ресайзе делает `autoUpdate` из `@floating-ui/dom` —
 * он сам использует `ResizeObserver`/`IntersectionObserver` и пассивные слушатели вместо
 * наивного враппера на каждый `scroll`/`resize`, поэтому отдельный rAF-throttling здесь
 * не нужен (в отличие от прежней ручной реализации в `GrSelect`/`GrDropdown`).
 *
 * Требует, чтобы `floatingEl` был примонтирован в DOM на момент открытия (обычно —
 * `<teleport to="body">` + `v-show`, а не `v-if`): позиционирование не может измерить
 * элемент, которого нет в дереве.
 */
export function useFloating(
  // Объединение, а не `Ref<HTMLElement | VirtualElement | null>`: аксессорный
  // `Ref` проверяется контравариантно по записи, и расширение элементного типа
  // отняло бы у шести нынешних потребителей право передавать свой `Ref` как есть.
  reference: Ref<HTMLElement | null> | (() => UseFloatingReference),
  floatingEl: Ref<HTMLElement | null>,
  open: Ref<boolean>,
  options: UseFloatingOptions = {},
): UseFloatingReturn {
  const readReference: () => UseFloatingReference
    = typeof reference === 'function' ? reference : () => reference.value

  const floatingStyle = ref<CSSProperties>({
    position: 'fixed',
    top: '0px',
    left: '0px',
  })
  function resolveRequestedPlacement(): Placement {
    return typeof options.placement === 'function' ? options.placement() : options.placement ?? 'bottom-start'
  }

  function resolveMatchWidth(): boolean | 'min' {
    return typeof options.matchWidth === 'function' ? options.matchWidth() : options.matchWidth ?? false
  }

  const resolvedPlacement = ref<Placement>(resolveRequestedPlacement())

  let stopAutoUpdate: (() => void) | null = null

  async function update(): Promise<void> {
    const reference = readReference()
    const floating = floatingEl.value
    if (!reference || !floating)
      return

    const middleware: Middleware[] = [
      offsetMiddleware(options.offsetPx ?? 8),
      flip({ padding: options.boundaryPadding ?? 8 }),
      shift({ padding: options.boundaryPadding ?? 8 }),
    ]

    const matchWidth = resolveMatchWidth()
    middleware.push(
      sizeMiddleware({
        padding: options.boundaryPadding ?? 8,
        apply({ rects, elements, availableHeight }) {
          // Сколько места осталось до края вьюпорта на той стороне, куда панель
          // в итоге встала. Считается после `flip`, поэтому сторона уже
          // окончательная. Слой только сообщает замер — решает панель.
          elements.floating.style.setProperty(
            floatingAvailableHeightVar,
            `${Math.max(0, Math.round(availableHeight))}px`,
          )

          if (!matchWidth)
            return

          if (matchWidth === 'min') {
            Object.assign(elements.floating.style, {
              width: 'max-content',
              minWidth: `${rects.reference.width}px`,
            })
            return
          }

          Object.assign(elements.floating.style, {
            width: `${rects.reference.width}px`,
            minWidth: '',
          })
        },
      }),
    )

    const { x, y, placement } = await computePosition(reference, floating, {
      placement: resolveRequestedPlacement(),
      strategy: 'fixed',
      middleware,
    })

    resolvedPlacement.value = placement
    floatingStyle.value = {
      position: 'fixed',
      left: `${roundByDpr(floating, x)}px`,
      top: `${roundByDpr(floating, y)}px`,
      zIndex: floatingLayerZIndex(options.zIndexVar ?? '--gr-z-dropdown'),
    }
  }

  function stop(): void {
    stopAutoUpdate?.()
    stopAutoUpdate = null
  }

  function start(): void {
    stop()
    const reference = readReference()
    const floating = floatingEl.value
    if (!reference || !floating)
      return

    // `autoUpdate` подписывается на `ResizeObserver`/`IntersectionObserver` для
    // последующих пересчётов, но не гарантирует немедленный вызов `update` —
    // особенно в средах без этих API (например, jsdom в тестах). Считаем позицию
    // сразу, чтобы панель не «мигала» в 0,0 до первого scroll/resize.
    void update()
    stopAutoUpdate = autoUpdate(reference, floating, () => void update())
  }

  // На какую ссылку подписан текущий `autoUpdate`. Отличает смену самого якоря
  // (подписку пересоздать) от смены его координат (достаточно `update()`): у
  // виртуального якоря объект один на всё время жизни.
  let subscribedTo: UseFloatingReference = null

  watch(
    [open, () => readReference()],
    ([isOpen, nextReference]) => {
      if (!isOpen || !nextReference) {
        stop()
        subscribedTo = null
        return
      }

      if (nextReference === subscribedTo && stopAutoUpdate)
        return

      // `floatingEl` монтируется в том же тике, что и `open` переключается
      // (v-show уже в DOM, но teleport/переход могут ещё не отработать) —
      // ждём тик, чтобы `getBoundingClientRect` не читал нулевые размеры.
      // Перепроверка `open`: панель могли закрыть, пока `start()` ждал в
      // очереди, — `stop()` уже отработал, и снимать подписку было бы некому.
      void nextTick(() => {
        if (!open.value)
          return
        subscribedTo = readReference()
        start()
      })
    },
    { immediate: true },
  )

  onBeforeUnmount(stop)

  return {
    floatingStyle,
    resolvedPlacement,
    update: () => void update(),
  }
}
