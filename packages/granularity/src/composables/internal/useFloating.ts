import type { CSSProperties, Ref } from 'vue'
import type { Middleware, Placement } from '@floating-ui/dom'
import { autoUpdate, computePosition, flip, offset as offsetMiddleware, shift, size as sizeMiddleware } from '@floating-ui/dom'
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'

export type UseFloatingPlacement = Placement

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
   */
  matchWidth?: boolean | 'min' | (() => boolean | 'min')
  /** CSS-переменная шкалы слоёв (см. `styles/tokens.css`). По умолчанию `--gr-z-dropdown`. */
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
  referenceEl: Ref<HTMLElement | null>,
  floatingEl: Ref<HTMLElement | null>,
  open: Ref<boolean>,
  options: UseFloatingOptions = {},
): UseFloatingReturn {
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
    const reference = referenceEl.value
    const floating = floatingEl.value
    if (!reference || !floating)
      return

    const middleware: Middleware[] = [
      offsetMiddleware(options.offsetPx ?? 8),
      flip({ padding: options.boundaryPadding ?? 8 }),
      shift({ padding: options.boundaryPadding ?? 8 }),
    ]

    const matchWidth = resolveMatchWidth()
    if (matchWidth) {
      middleware.push(
        sizeMiddleware({
          apply({ rects, elements }) {
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
    }

    const { x, y, placement } = await computePosition(reference, floating, {
      placement: resolveRequestedPlacement(),
      strategy: 'fixed',
      middleware,
    })

    resolvedPlacement.value = placement
    floatingStyle.value = {
      position: 'fixed',
      left: `${x}px`,
      top: `${y}px`,
      zIndex: `var(${options.zIndexVar ?? '--gr-z-dropdown'})`,
    }
  }

  function stop(): void {
    stopAutoUpdate?.()
    stopAutoUpdate = null
  }

  function start(): void {
    stop()
    const reference = referenceEl.value
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

  watch(
    open,
    (isOpen) => {
      if (!isOpen) {
        stop()
        return
      }

      // `floatingEl` монтируется в том же тике, что и `open` переключается
      // (v-show уже в DOM, но teleport/переход могут ещё не отработать) —
      // ждём тик, чтобы `getBoundingClientRect` не читал нулевые размеры.
      void nextTick(() => start())
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
